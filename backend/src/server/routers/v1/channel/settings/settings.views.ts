import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { PostChantingSchema } from '#server/routers/v1/channel/settings/settings.schemas';
import { authenticated, validate } from '#server/stackMiddlewares';
import { GetChantingSettingsResponse } from '#shared/types/api/channel';
import { json } from 'body-parser';


export const getChantingView = new ExpressStack()
  .useNative(json())
  .use(authenticated)
  .use(async (req, res) => {
    const response: GetChantingSettingsResponse = {
      data: req.user.channel.chantingSettings,
    };

    res.json(response);
  });

export const postChantingView = new ExpressStack()
  .useNative(json())
  .use(authenticated)
  .use(validate(PostChantingSchema))
  .use(async (req, res) => {
    try {
      await prisma.channel.updateChantingFromApi(req.user.id, req.validated.body);

      res.sendStatus(200);
    } catch (err) {
      logger.error('Failed to update chanting settings', {
        label: ['APIv1', 'channel', 'settings', 'postChantingView'],
        error: err,
      });

      throw new ServerError(500, 'Failed to update chanting settings');
    }
  });
