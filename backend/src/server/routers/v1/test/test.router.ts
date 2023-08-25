import { getLazyView, getPortView, getPreflightView, getTestView } from '#server/routers/v1/test/test.views';
import { serverPort } from '#shared/constants';
import { Router } from 'express';


export const testRouter = Router();

testRouter.get('/', ...getTestView.unwrap());

testRouter.get('/lazy', ...getLazyView.unwrap());

testRouter.get('/port', ...getPortView.unwrap(serverPort));

testRouter.get('/preflight', ...getPreflightView.unwrap());
