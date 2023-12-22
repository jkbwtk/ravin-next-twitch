import {
  deleteTemplatesView,
  getTemplatesView,
  patchTemplatesView,
  postTemplatesView,
} from '#server/routers/v1/templates/templates.views';
import { Router } from 'express';


export const createTemplatesRouter = (): Router => {
  const templatesRouter = Router();

  templatesRouter.get('/', ...getTemplatesView.unwrap());

  templatesRouter.post('/', ...postTemplatesView.unwrap());

  templatesRouter.patch('/', ...patchTemplatesView.unwrap());

  templatesRouter.delete('/', ...deleteTemplatesView.unwrap());

  return templatesRouter;
};
