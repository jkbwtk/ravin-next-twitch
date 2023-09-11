import { Config } from '#lib/Config';
import { ExtendedCron } from '#lib/ExtendedCron';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { PatchConfigSchema } from '#server/routers/v1/admin/admin.schemas';
import { admin, authenticated, validate } from '#server/stackMiddlewares';
import { GetScheduledJobsResponse } from '#shared/types/api/admin';
import { json } from 'body-parser';


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

      res.sendStatus(200);
    } catch (err) {
      logger.error('Failed to update config', {
        label: ['APIv1', 'admin', 'patchConfigView'],
        error: err,
      });

      throw new ServerError(500, 'Failed to update config');
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

      throw new ServerError(500, 'Failed to get scheduled jobs');
    }
  });
