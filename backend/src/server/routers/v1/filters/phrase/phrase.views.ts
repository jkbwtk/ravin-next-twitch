import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { SocketServer } from '#server/SocketServer';
import { idListFilter } from '#server/middlewares/idListFilter';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { PatchPhraseFilterSchema, PostPhraseFilterSchema } from '#server/routers/v1/filters/phrase/phrase.schemas';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';
import { GetPhraseFiltersPaginatedResponse, GetPhraseFiltersResponse, PhraseFilter } from '#types/api/filters';
import { json } from 'body-parser';


export const getPhraseFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetPhraseFiltersPaginatedResponse.or(GetPhraseFiltersResponse)))
  .use(limitOffsetPagination())
  .use(idListFilter())
  .use(async (req, res) => {
    try {
      if (req.pagination) {
        const filters = await prisma.phraseFilter.getByChannelId(req.user.id, req.pagination, req.idListFilter);

        res.jsonValidated({
          data: filters.map((f) => f.serialize()),

          total: await prisma.phraseFilter.countByChannelId(req.user.id),
          limit: req.pagination.take,
          offset: req.pagination.skip,
        });
      } else {
        const filters = await prisma.phraseFilter.getByChannelId(req.user.id, req.pagination, req.idListFilter);

        res.jsonValidated({
          data: filters.map((f) => f.serialize()),
        });
      }
    } catch (err) {
      logger.warn('Failed to get phrase filters', {
        error: err,
        label: ['APIv1', 'phrase', 'getPhraseFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get phrase filters');
    }
  });

export const postPhraseFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostPhraseFilterSchema))
  .use(validateResponse(PhraseFilter))
  .use(async (req, res) => {
    try {
      const filter = await prisma.phraseFilter.createFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'NEW_PHRASE_FILTER', filter.serialize());

      res.jsonValidated(filter.serialize());
    } catch (err) {
      logger.warn('Failed to create phrase filter', {
        error: err,
        label: ['APIv1', 'phrase', 'postPhraseFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create phrase filter');
    }
  });

export const patchPhraseFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchPhraseFilterSchema))
  .use(validateResponse(PhraseFilter))
  .use(async (req, res) => {
    try {
      const filter = await prisma.phraseFilter.updateFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'UPD_PHRASE_FILTER', filter.serialize());

      res.json(filter.serialize());
    } catch (err) {
      logger.warn('Failed to update phrase filter', {
        error: err,
        label: ['APIv1', 'phrase', 'patchPhraseFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update phrase filter');
    }
  });

export const deletePhraseFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchPhraseFilterSchema))
  .use(async (req, res) => {
    try {
      await prisma.phraseFilter.deleteFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'DEL_PHRASE_FILTER', req.validated.body.id);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to delete phrase filter', {
        error: err,
        label: ['APIv1', 'phrase', 'deletePhraseFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete phrase filter');
    }
  });
