import { getLazyView, getTestView } from '#server/routers/v1/test/test.views';
import { Router } from 'express';


export const testRouter = Router();

testRouter.get('/', ...getTestView.unwrap());

testRouter.get('/lazy', ...getLazyView.unwrap());
