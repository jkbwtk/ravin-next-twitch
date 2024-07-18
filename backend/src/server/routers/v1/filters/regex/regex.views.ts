import { RegexFilterController } from '#database/controllers/RegexFilterController';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { idListFilter } from '#server/middlewares/idListFilter';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { DeleteRegexFilterSchema, PatchRegexFilterSchema, PostRegexFilterSchema } from '#server/routers/v1/filters/regex/regex.schemas';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';
import { GetRegexFiltersPaginatedResponse, GetRegexFiltersResponse, RegexFilter } from '#types/api/filters';
import { json } from 'body-parser';


export const getRegexFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetRegexFiltersPaginatedResponse.or(GetRegexFiltersResponse)))
  .use(limitOffsetPagination())
  .use(idListFilter())
  .use(async (req, res) => {
    try {
      const filters = await RegexFilterController.getByUserId(req.user.id, {
        pagination: req.pagination,
        idListFilter: req.idListFilter,
      });

      const paginationMetadata = req.pagination ? {
        total: await RegexFilterController.countByUserId(req.user.id),
        limit: req.pagination.limit,
        offset: req.pagination.offset,
      } : null;

      res.jsonValidated({
        data: RegexFilterController.$utils.serialize(filters),

        ...paginationMetadata,
      });
    } catch (err) {
      logger.warn('Failed to get regex filters', {
        error: err,
        label: ['APIv1', 'regex', 'getRegexFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get regex filters');
    }
  });

export const postRegexFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostRegexFilterSchema))
  .use(validateResponse(RegexFilter))
  .use(async (req, res) => {
    try {
      const filter = await RegexFilterController.create({
        ...req.validated.body,
        channelUserId: req.user.id,
      });

      if (filter === null) {
        throw new Error('Create regex filter returned null');
      }

      res.jsonValidated(RegexFilterController.$utils.serialize(filter));
    } catch (err) {
      logger.warn('Failed to create regex filter', {
        error: err,
        label: ['APIv1', 'regex', 'postRegexFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create regex filter');
    }
  });

export const patchRegexFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchRegexFilterSchema))
  .use(validateResponse(RegexFilter))
  .use(async (req, res) => {
    try {
      const filter = await RegexFilterController.update({
        ...req.validated.body,
        channelUserId: req.user.id,
      });

      if (filter === null) {
        throw new Error('Update regex filter returned null');
      }

      res.jsonValidated(RegexFilterController.$utils.serialize(filter));
    } catch (err) {
      logger.warn('Failed to update regex filter', {
        error: err,
        label: ['APIv1', 'regex', 'patchRegexFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update regex filter');
    }
  });

export const deleteRegexFiltersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(DeleteRegexFilterSchema))
  .use(async (req, res) => {
    try {
      await RegexFilterController.delete({
        ...req.validated.body,
      });

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to delete regex filter', {
        error: err,
        label: ['APIv1', 'regex', 'deleteRegexFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete regex filter');
    }
  });
