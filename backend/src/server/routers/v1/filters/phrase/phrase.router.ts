import { deletePhraseFiltersView, getPhraseFiltersView, patchPhraseFiltersView, postPhraseFiltersView } from '#server/routers/v1/filters/phrase/phrase.views';
import { Router } from 'express';


export const createPhraseRouter = (): Router => {
  const phraseRouter = Router();

  phraseRouter.get('/', ...getPhraseFiltersView.unwrap());

  phraseRouter.post('/', ...postPhraseFiltersView.unwrap());

  phraseRouter.patch(patchPhraseFiltersView.url, ...patchPhraseFiltersView.unwrap());

  phraseRouter.delete(deletePhraseFiltersView.url, ...deletePhraseFiltersView.unwrap());

  return phraseRouter;
};
