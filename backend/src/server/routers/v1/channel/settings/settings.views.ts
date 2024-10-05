import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { PostChantingSchema, PostOfflineChatSettingsSchema } from '#server/routers/v1/channel/settings/settings.schemas';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { GetChantingSettingsResponse, GetOfflineChatSettingsResponse } from '#types/api/channel';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';
import { ChannelController } from '#database/controllers/ChannelController';


export const getChantingView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validateResponse(GetChantingSettingsResponse))
  .use(async (req, res) => {
    try {
      const channel = await ChannelController.getByUserId(req.user.id);

      if (channel === null) {
        throw new ServerError(HttpCodes.InternalServerError, 'Failed to get channel');
      }

      res.jsonValidated({
        data: channel.chantingSettings,
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
      await ChannelController.updateByUserId(req.user.id, {
        chantingSettings: req.validated.body,
      });

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to update chanting settings', {
        label: ['APIv1', 'channel', 'settings', 'postChantingView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update chanting settings');
    }
  });


export const getOfflineChatSettingsView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validateResponse(GetOfflineChatSettingsResponse))
  .use(async (req, res) => {
    try {
      const channel = await ChannelController.getByUserId(req.user.id);

      if (channel === null) {
        throw new ServerError(HttpCodes.InternalServerError, 'Failed to get channel');
      }

      res.jsonValidated({
        data: channel.offlineChatSettings,
      });
    } catch (err) {
      logger.error('Failed to get offline chat settings', {
        label: ['APIv1', 'channel', 'settings', 'getOfflineChatSettingsView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get offline chat settings');
    }
  });

export const postOfflineChatSettingsView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostOfflineChatSettingsSchema))
  .use(async (req, res) => {
    try {
      await ChannelController.updateByUserId(req.user.id, {
        offlineChatSettings: req.validated.body,
      });

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to update offline chat settings', {
        label: ['APIv1', 'channel', 'settings', 'postOfflineChatSettingsView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update offline chat settings');
    }
  });
