import { getTwitchCallback, getTwitchStrategy, getUserView, postLogoutView } from '#server/routers/v1/auth/auth.views';
import { setupPassport } from '#server/routers/v1/auth/passportUtils';
import { Router } from 'express';


export const createAuthRouter = (): Router => {
  const authRouter = Router();

  setupPassport();

  authRouter.get('/user', ...getUserView.unwrap());

  authRouter.post('/logout', ...postLogoutView.unwrap());

  authRouter.get('/twitch', ...getTwitchStrategy.unwrap());

  authRouter.get('/callback', ...getTwitchCallback.unwrap());

  return authRouter;
};
