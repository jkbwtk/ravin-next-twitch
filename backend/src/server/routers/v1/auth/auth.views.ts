import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { SocketServer } from '#server/SocketServer';
import { authScopes } from '#server/routers/v1/auth/authShared';
import { passportReady } from '#server/routers/v1/auth/passportUtils';
import { authenticated, validateResponse, waitUntilReady } from '#server/stackMiddlewares';
import { GetFrontendUser } from '#shared/types/api/auth';
import passport from 'passport';
import { HttpCodes } from '#shared/httpCodes';


export const getUserView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetFrontendUser))
  .use((req, res) => {
    try {
      res.jsonValidated({
        data: {
          id: req.user.id,
          login: req.user.login,
          displayName: req.user.displayName,
          profileImageUrl: req.user.profileImageUrl,
          admin: req.user.admin,
        },
      });
    } catch (err) {
      logger.error('Failed to get user', {
        label: ['APIv1', 'auth', 'getUserView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get user');
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

        return reject(new ServerError(HttpCodes.InternalServerError, 'Failed to logout user'));
      }

      await prisma.systemNotification.createNotification(
        user.id,
        'Logged out',
        'You have been logged out of the dashboard.',
      );

      SocketServer.disconnectUser(user.id);
      res.sendStatus(HttpCodes.OK);
      resolve();
    });
  }));

export const getTwitchStrategy = new ExpressStack()
  .usePreflight(waitUntilReady(passportReady))
  .useNative(passport.authenticate('twitch', { scope: authScopes, successRedirect: '/dashboard', failureRedirect: '/' }));

export const getTwitchCallback = new ExpressStack()
  .usePreflight(waitUntilReady(passportReady))
  .useNative(passport.authenticate('twitch', { successRedirect: '/dashboard', failureRedirect: '/' }));

