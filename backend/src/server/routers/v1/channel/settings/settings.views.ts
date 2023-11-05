import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { PostChantingSchema } from '#server/routers/v1/channel/settings/settings.schemas';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { GetChantingSettingsResponse } from '#shared/types/api/channel';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';


export const getChantingView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validateResponse(GetChantingSettingsResponse))
  .use(async (req, res) => {
    try {
      res.jsonValidated({
        data: req.user.channel.chantingSettings,
      });
    } catch (err) {
      logger.error('Failed to get chanting settings', {
        label: ['APIv1', 'channel', 'settings', 'getChantingView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get chanting settings');
    }
  });

export const postChantingView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostChantingSchema))
  .use(async (req, res) => {
    try {
      await prisma.channel.updateChantingFromApi(req.user.id, req.validated.body);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to update chanting settings', {
        label: ['APIv1', 'channel', 'settings', 'postChantingView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update chanting settings');
    }
  });
