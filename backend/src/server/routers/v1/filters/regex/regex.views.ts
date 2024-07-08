import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { SocketServer } from '#server/SocketServer';
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
      if (req.pagination) {
        const filters = await prisma.regexFilter.getByChannelId(req.user.id, req.pagination, req.idListFilter);

        res.jsonValidated({
          data: filters.map((f) => f.serialize()),

          total: await prisma.regexFilter.countByChannelId(req.user.id),
          limit: req.pagination.limit,
          offset: req.pagination.offset,
        });
      } else {
        const filters = await prisma.regexFilter.getByChannelId(req.user.id, req.pagination, req.idListFilter);

        res.jsonValidated({
          data: filters.map((f) => f.serialize()),
        });
      }
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
      const filter = await prisma.regexFilter.createFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'NEW_REGEX_FILTER', filter.serialize());

      res.jsonValidated(filter.serialize());
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
      const filter = await prisma.regexFilter.updateFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'UPD_REGEX_FILTER', filter.serialize());

      res.json(filter.serialize());
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
      await prisma.regexFilter.deleteFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'DEL_REGEX_FILTER', req.validated.body.id);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to delete regex filter', {
        error: err,
        label: ['APIv1', 'regex', 'deleteRegexFiltersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete regex filter');
    }
  });
