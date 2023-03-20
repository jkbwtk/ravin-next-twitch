import { Router as expressRouter } from 'express';
import { v1Router } from './v1/v1Router';
import { invalidRoute } from '../middlewares';


export const apiRouter = expressRouter();

apiRouter.use('/v1', v1Router);

apiRouter.use('*', invalidRoute);
