import { deleteRegexFiltersView, getRegexFiltersView, patchRegexFiltersView, postRegexFiltersView } from '#server/routers/v1/filters/regex/regex.views';
import { Router } from 'express';


export const createRegexRouter = (): Router => {
  const regexRouter = Router();

  regexRouter.get('/', ...getRegexFiltersView.unwrap());

  regexRouter.post('/', ...postRegexFiltersView.unwrap());

  regexRouter.patch('/', ...patchRegexFiltersView.unwrap());

  regexRouter.delete('/', ...deleteRegexFiltersView.unwrap());

  return regexRouter;
};
