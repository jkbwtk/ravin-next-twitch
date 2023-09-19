import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { createDevAuthStrategy } from '#server/routers/v1/auth/authDev';
import { createProdAuthStrategy } from '#server/routers/v1/auth/authProd';
import { isDevApi, isDevMode } from '#shared/constants';
import { basicSignal } from '#shared/utils';
import passport from 'passport';


export enum PassportStatus {
  Uninitialized = -1,
  Initializing = 0,
  Initialized = 1,
}

export const passportStatusSignal = basicSignal<PassportStatus>(PassportStatus.Uninitialized);

if (isDevMode) {
  passportStatusSignal.subscribe((v) => {
    logger.debug('Passport ready signal changed state to [%s]', PassportStatus[v], {
      label: ['APIv1', 'auth', 'passportReadySignal'],
    });
  });
}

export const passportReady = (): boolean => passportStatusSignal() === PassportStatus.Initialized;

export const setupPassport = async (): Promise<void> => {
  if (passportStatusSignal() !== PassportStatus.Uninitialized) return;

  passportStatusSignal.set(PassportStatus.Initializing);

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

  const strategyFactory = isDevApi ? createDevAuthStrategy : createProdAuthStrategy;
  const strategy = await strategyFactory();

  passport.use('twitch', strategy);
  passportStatusSignal.set(PassportStatus.Initialized);
};
