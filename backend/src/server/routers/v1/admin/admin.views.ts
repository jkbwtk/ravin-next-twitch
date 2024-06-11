import { Config } from '#lib/Config';
import { ExtendedCron } from '#lib/ExtendedCron';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { PatchConfigSchema, PostPublicConfigSchema } from '#server/routers/v1/admin/admin.schemas';
import { admin, authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { GetScheduledJobsResponse } from '#types/api/admin';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';
import { GetConfig } from '#types/api/auth';
import { SocketServer } from '#server/SocketServer';


export const patchConfigView = new ExpressStack()
  .usePreflight(authenticated)
  .usePreflight(admin)
  .useNative(json())
  .use(validate(PatchConfigSchema))
  .use(async (req, res) => {
    const changes: [string, string][] = [];

    for (const [key, value] of Object.entries(req.validated.body)) {
      if (value === undefined) continue;
      changes.push([key, value]);
    }

    try {
      await Config.batchSet(changes);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to update config', {
        label: ['APIv1', 'admin', 'patchConfigView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update config');
    }
  });

export const getScheduledJobsView = new ExpressStack()
  .usePreflight(authenticated)
  .usePreflight(admin)
  .use(async (req, res) => {
    try {
      const resp: GetScheduledJobsResponse = {
        data: ExtendedCron.scheduledJobs.map((job) => job.serialize()),
      };

      res.json(resp);
    } catch (err) {
      logger.error('Failed to get scheduled jobs', {
        label: ['APIv1', 'admin', 'getScheduledJobsView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get scheduled jobs');
    }
  });

export const getPublicConfigView = new ExpressStack()
  .usePreflight(authenticated)
  .usePreflight(admin)
  .use(validateResponse(GetConfig))
  .use(async (req, res) => {
    try {
      res.jsonValidated({
        data: {
          // @ts-expect-error Converted to number by Zod
          defaultPaginationLimit: await Config.getOrFail('defaultPaginationLimit'),
          // @ts-expect-error Converted to array of numbers by Zod
          paginationLimitOptions: await Config.getOrFail('paginationLimitOptions'),
        },
      });
    } catch (err) {
      logger.error('Failed to get public config', {
        label: ['APIv1', 'admin', 'getPublicConfigView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get public config');
    }
  });


export const postPublicConfigView = new ExpressStack()
  .usePreflight(authenticated)
  .usePreflight(admin)
  .useNative(json())
  .use(validate(PostPublicConfigSchema))
  .use(async (req, res) => {
    const changes: [string, string][] = [];
    const changedKeys = Object.keys(req.validated.body);

    await Config.shadowBulkRestore(changedKeys);

    for (const [key, value] of Object.entries(req.validated.body)) {
      if (value === undefined) continue;
      changes.push([key, JSON.stringify(value)]);
    }

    try {
      await Config.batchSet(changes);

      res.sendStatus(HttpCodes.OK);
      SocketServer.emitToAll('UPD_SESSION');
    } catch (err) {
      logger.error('Failed to update public config', {
        label: ['APIv1', 'admin', 'postPublicConfigView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update public config');
    }
  });
