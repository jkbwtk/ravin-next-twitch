import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { SocketServer } from '#server/SocketServer';
import { createDevAuthStrategy } from '#server/routers/v1/auth/authDev';
import { createProdAuthStrategy } from '#server/routers/v1/auth/authProd';
import { authScopes } from '#server/routers/v1/auth/authShared';
import { authenticated, waitUntilReady } from '#server/stackMiddlewares';
import { isDevApi } from '#shared/constants';
import { GetFrontendUser } from '#shared/types/api/auth';
import { basicSignal } from '#shared/utils';
import passport from 'passport';


export const getUserView = new ExpressStack()
  .usePreflight(authenticated)
  .use((req, res) => {
    try {
      const resp: GetFrontendUser = {
        data: {
          id: req.user.id,
          login: req.user.login,
          displayName: req.user.displayName,
          profileImageUrl: req.user.profileImageUrl,
          admin: req.user.admin,
        },
      };

      res.json(resp);
    } catch (err) {
      logger.error('Failed to get user', {
        label: ['APIv1', 'auth', 'getUserView'],
        error: err,
      });

      throw new ServerError(500, 'Failed to get user');
    }
  });

export const postLogoutView = new ExpressStack()
  .usePreflight(authenticated)
  .use((req, res) => new Promise<void>((resolve, reject) => {
    const user = req.user;

    req.logout(async (err) => {
      if (err) {
        logger.error('Failed to logout user', {
          label: ['APIv1', 'auth', 'postLogoutView'],
          error: err,
        });

        return reject(new ServerError(500, 'Failed to logout user'));
      }

      await prisma.systemNotification.createNotification(
        user.id,
        'Logged out',
        'You have been logged out of the dashboard.',
      );

      SocketServer.disconnectUser(user.id);
      res.sendStatus(200);
      resolve();
    });
  }));

const passportReadySignal = basicSignal<boolean>(false);

passportReadySignal.subscribe((v) => {
  logger.debug('Passport ready signal changed state to [%o]', v, {
    label: ['APIv1', 'auth', 'passportReadySignal'],
  });
});

if (isDevApi) {
  createDevAuthStrategy().then((strategy) => {
    passport.use('twitch', strategy);
    passportReadySignal.set(true);
  });
} else {
  createProdAuthStrategy().then((strategy) => {
    passport.use('twitch', strategy);
    passportReadySignal.set(true);
  });
}

passport.serializeUser<string>((user, done) => {
  done(null, user.id);
});

passport.deserializeUser<string>(async (id, done) => {
  const user = await prisma.user.getById(id);

  if (user !== null) return done(null, user);

  logger.warn({
    message: 'Failed to fetch user profile with id [%s]',
    args: [id],
  });
  done(null, false);
});

export const getTwitchStrategy = new ExpressStack()
  .usePreflight(waitUntilReady(passportReadySignal))
  .useNative(passport.authenticate('twitch', { scope: authScopes, successRedirect: '/dashboard', failureRedirect: '/' }));

export const getTwitchCallback = new ExpressStack()
  .usePreflight(waitUntilReady(passportReadySignal))
  .useNative(passport.authenticate('twitch', { successRedirect: '/dashboard', failureRedirect: '/' }));

