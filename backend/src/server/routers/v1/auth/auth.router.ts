import { getTwitchCallback, getTwitchStrategy, getUserView, postLogoutView } from '#server/routers/v1/auth/auth.views';
import { Router } from 'express';


export const authRouter = Router();

authRouter.get('/user', ...getUserView.unwrap());

authRouter.post('/logout', ...postLogoutView.unwrap());

authRouter.get('/twitch', ...getTwitchStrategy.unwrap());

authRouter.get('/callback', ...getTwitchCallback.unwrap());
