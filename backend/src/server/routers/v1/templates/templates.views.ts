import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { SocketServer } from '#server/SocketServer';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';
import { GetTemplatesPaginatedResponse, GetTemplatesResponse, TestTemplateResponse } from '#types/api/templates';
import { DeleteTemplateSchema, PatchTemplateSchema, PostTemplateSchema, TestTemplateSchema } from '#server/routers/v1/templates/templates.schemas';
import { TemplateTester } from '#bot/templates/TemplateTester';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { templateTesterMiddleware } from '#server/routers/v1/templates/templates.middlewares';
import { TemplateController } from '#database/controllers/TemplateController';
import { TemplateSerializer } from '#database/serializers/TemplateSerializer';


export const getTemplatesView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetTemplatesPaginatedResponse.or(GetTemplatesResponse)))
  .use(limitOffsetPagination())
  .use(async (req, res) => {
    try {
      const templates = await TemplateController.getByUserId(req.user.id, { pagination: req.pagination });

      if (req.pagination) {
        res.jsonValidated({
          data: TemplateSerializer(templates),

          total: await TemplateController.countByUserId(req.user.id),
          limit: req.pagination.limit,
          offset: req.pagination.offset,
        });
      } else {
        res.jsonValidated({
          data: TemplateSerializer(templates),
        });
      }
    } catch (err) {
      logger.error('Failed to get templates', {
        error: err,
        label: ['APIv1', 'templates', 'getTemplatesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get templates');
    }
  });

export const postTemplatesView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostTemplateSchema))
  .use(templateTesterMiddleware)
  .use(async (req, res) => {
    try {
      const template = await TemplateController.create({
        ...req.validated.body,
        environments: req.templateIssues?.getSupportedEnvironments(),
        channelUserId: req.user.id,
      });

      if (!template) {
        throw new Error('Failed to create template');
      }

      SocketServer.emitToUser(req.user.id, 'NEW_TEMPLATE', TemplateSerializer(template));

      res.sendStatus(HttpCodes.Created);
    } catch (err) {
      logger.error('Failed to create template', {
        error: err,
        label: ['APIv1', 'template', 'postTemplatesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create template');
    }
  });


export const testTemplateView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(TestTemplateSchema))
  .use(validateResponse(TestTemplateResponse))
  .use(async (req, res) => {
    try {
      const issues = await TemplateTester.test(req.validated.body.template);

      res.jsonValidated({
        data: issues.serialize(),
      });
    } catch (err) {
      logger.error('Failed to test template', {
        error: err,
        label: ['APIv1', 'templates', 'testTemplateView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to test template');
    }
  });

export const patchTemplatesView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchTemplateSchema))
  .use(templateTesterMiddleware)
  .use(async (req, res) => {
    try {
      const template = await TemplateController.update({
        ...req.validated.body,
        environments: req.templateIssues?.getSupportedEnvironments(),
      });

      if (!template) {
        throw new Error('Failed to update template');
      }

      SocketServer.emitToUser(req.user.id, 'UPD_TEMPLATE', TemplateSerializer(template));

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to update templates', {
        error: err,
        label: ['APIv1', 'templates', 'patchTemplatesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update templates');
    }
  });

export const deleteTemplatesView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(DeleteTemplateSchema))
  .use(async (req, res) => {
    try {
      await TemplateController.delete(req.validated.body);

      SocketServer.emitToUser(req.user.id, 'DEL_TEMPLATE', req.validated.body.id);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to delete templates', {
        error: err,
        label: ['APIv1', 'templates', 'deleteTemplatesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete templates');
    }
  });
