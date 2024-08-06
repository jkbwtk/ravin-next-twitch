import { PhraseFilterController } from '#database/controllers/PhraseFilterController';
import { PhraseFilterSerializer } from '#database/serializers/PhrazeFilterSerializer';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { idListFilter } from '#server/middlewares/idListFilter';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { PatchPhraseFilterSchema, PostPhraseFilterSchema } from '#server/routers/v1/filters/phrase/phrase.schemas';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';
import { GetPhraseFiltersPaginatedResponse, GetPhraseFiltersResponse, PhraseFilterApi } from '#types/api/filters';
import { json } from 'body-parser';


export const getPhraseFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetPhraseFiltersPaginatedResponse.or(GetPhraseFiltersResponse)))
  .use(limitOffsetPagination())
  .use(idListFilter())
  .use(async (req, res) => {
    try {
      const filters = await PhraseFilterController.getByUserId(req.user.id, {
        pagination: req.pagination,
        idListFilter: req.idListFilter,
      });

      if (req.pagination) {
        res.jsonValidated({
          data: PhraseFilterSerializer(filters),

          total: await PhraseFilterController.countByUserId(req.user.id),
          limit: req.pagination.limit,
          offset: req.pagination.offset,
        });
      } else {
        res.jsonValidated({
          data: PhraseFilterSerializer(filters),
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
  .use(validateResponse(PhraseFilterApi))
  .use(async (req, res) => {
    try {
      const filter = await PhraseFilterController.create({
        ...req.validated.body,
        channelUserId: req.user.id,
      });

      if (filter === null) {
        throw new Error('Create phrase filter returned null');
      }

      res.jsonValidated(PhraseFilterSerializer(filter));
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
  .use(validateResponse(PhraseFilterApi))
  .use(async (req, res) => {
    try {
      const filter = await PhraseFilterController.update({
        ...req.validated.body,
        channelUserId: req.user.id,
      });

      if (filter === null) {
        throw new Error('Update phrase filter returned null');
      }

      res.json(PhraseFilterSerializer(filter));
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
      await PhraseFilterController.delete({
        ...req.validated.body,
      });

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to delete phrase filter', {
        error: err,
        label: ['APIv1', 'phrase', 'deletePhraseFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete phrase filter');
    }
  });
