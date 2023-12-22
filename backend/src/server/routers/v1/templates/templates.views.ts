import { Bot } from '#bot/Bot';
import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { SocketServer } from '#server/SocketServer';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';
import { GetTemplatesResponse } from '#shared/types/api/templates';
import { DeleteTemplateSchema, PatchTemplateSchema, PostTemplateSchema } from '#server/routers/v1/templates/templates.schemas';
import { TemplateTester } from '#bot/TemplateTester';


export const getTemplatesView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetTemplatesResponse))
  .use(async (req, res) => {
    try {
      const templates = await prisma.template.getByChannelId(req.user.id);

      res.jsonValidated({
        data: templates.map((c) => c.serialize()),
      });
    } catch (err) {
      logger.warn('Failed to get templates', {
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
  .use(async (req, res) => {
    try {
      const template = await prisma.template.createFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'NEW_TEMPLATE', template.serialize());

      res.sendStatus(HttpCodes.Created);
    } catch (err) {
      logger.warn('Failed to create template', {
        error: err,
        label: ['APIv1', 'template', 'postTemplatesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create template');
    }
  });

export const patchTemplatesView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchTemplateSchema))
  .use(async (req, res) => {
    try {
      if (req.validated.body.template !== undefined) {
        const issues = await TemplateTester.test(req.validated.body.template);
        console.log(issues);
      }
      const command = await prisma.template.updateFromApi(req.validated.body);
      SocketServer.emitToUser(req.user.id, 'UPD_TEMPLATE', command.serialize());

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      console.log(err);
      logger.warn('Failed to update templates', {
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
      await prisma.template.deleteFromApi(req.validated.body);
      await Bot.reloadChannelCommands(req.user.id);
      SocketServer.emitToUser(req.user.id, 'DEL_TEMPLATE', req.validated.body.id);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to delete templates', {
        error: err,
        label: ['APIv1', 'templates', 'deleteTemplatesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete templates');
    }
  });
