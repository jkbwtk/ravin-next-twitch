import { User as UserEntity } from '#database/entities/User';
import { Router as expressRouter } from 'express';
import passport from 'passport';
import { GetFrontendUser } from '#shared/types/api/auth';
import { createProdAuthStrategy } from '#server/routers/v1/authProd';
import { isDevApi, isDevMode } from '#shared/constants';
import { createDevAuthStrategy } from '#server/routers/v1/authDev';
import { authScopes } from '#server/routers/v1/authShared';
import { display } from '#lib/display';
import { SystemNotification } from '#database/entities/SystemNotification';
import { SocketServer } from '#server/SocketServer';


export const authRouter = async (): Promise<expressRouter> => {
  const authRouter = expressRouter();

  passport.serializeUser<string>((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser<string>(async (id, done) => {
    const user = await UserEntity.getById(id);

    if (user !== null) return done(null, user);

    display.error.nextLine('authRouter:deserializeUser', 'Failed to fetch user profile');
    done(new Error('Failed to fetch user profile'));
  });

  if (isDevApi) {
    passport.use('twitch', await createDevAuthStrategy());
  } else {
    passport.use('twitch', await createProdAuthStrategy());
  }

  authRouter.get('/twitch',
    passport.authenticate('twitch', { scope: authScopes, successRedirect: '/dashboard', failureRedirect: '/' }),
  );

  authRouter.get('/callback',
    passport.authenticate('twitch', { successRedirect: '/dashboard', failWithError: true }),
  );

  authRouter.get('/user', async (req, res) => {
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    if (req.isUnauthenticated()) return res.sendStatus(401);
    if (req.user === undefined) return res.sendStatus(401);

    const resp: GetFrontendUser = {
      data: {
        id: req.user.id,
        login: req.user.login,
        displayName: req.user.displayName,
        profileImageUrl: req.user.profileImageUrl,
      },
    };

    res.json(resp);
  });

  authRouter.post('/logout', (req, res) => {
    if (req.isUnauthenticated() || req.user === undefined) return res.sendStatus(401);
    const user = req.user;

    req.logout(async (err) => {
      if (err && isDevMode) res.status(500).send(err);
      else if (err) res.sendStatus(500);
      else {
        await SystemNotification.createNotification(
          user.id,
          'Logged out',
          'You have been logged out of the dashboard.',
        );

        SocketServer.disconnectUser(user.id);
        res.sendStatus(200);
      }
    });
  });

  return authRouter;
};
