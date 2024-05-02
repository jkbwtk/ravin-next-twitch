import { createPhraseRouter } from '#server/routers/v1/filters/phrase/phrase.router';
import { createRegexRouter } from '#server/routers/v1/filters/regex/regex.router';
import { Router } from 'express';


export const createFiltersRouter = (): Router => {
  const filtersRouter = Router();

  filtersRouter.use('/phrase', createPhraseRouter());

  filtersRouter.use('/regex', createRegexRouter());

  return filtersRouter;
};
