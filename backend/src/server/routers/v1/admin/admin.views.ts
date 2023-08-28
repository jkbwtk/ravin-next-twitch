import { Config } from '#lib/Config';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { PatchConfigSchema } from '#server/routers/v1/admin/admin.schemas';
import { admin, authenticated, validate } from '#server/stackMiddlewares';
import { GetScheduledJobsResponse } from '#shared/types/api/admin';
import { json } from 'body-parser';
import { Cron } from 'croner';


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
        data: Cron.scheduledJobs.map((job) => {
          const nextRun = job.nextRun();
          const lastRun = job.currentRun();
          const maxRuns = job.options.maxRuns ?? null;

          return {
            name: job.name ?? null,
            cron: job.getPattern() ?? null,
            nextRun: nextRun ? nextRun.getTime() : null,
            lastRun: lastRun ? lastRun.getTime() : null,
            maxRuns: maxRuns === Infinity ? null : maxRuns,
            isRunning: job.isRunning(),
            isStopped: job.isStopped(),
            isBusy: job.isBusy(),
          };
        }),
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
