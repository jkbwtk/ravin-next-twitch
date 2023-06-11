import { Router as expressRouter } from 'express';
import { json as jsonParser } from 'body-parser';
import { GetMessagesResponse } from '#shared/types/api/logs';
import { Message } from '#database/entities/Message';
import { display } from '#lib/display';


export const logsRouter = async (): Promise<expressRouter> => {
  const logsRouter = expressRouter();

  logsRouter.use(async (req, res, next) => {
    if (req.isUnauthenticated()) res.sendStatus(401);
    else if (req.user === undefined) res.sendStatus(401);
    else next();
  });

  logsRouter.use(jsonParser());

  logsRouter.get('/messages', async (req, res) => {
    try {
      if (req.user === undefined) return res.sendStatus(401);

      const messages = await Message.getByChannelId(req.user.id);

      const response: GetMessagesResponse = {
        data: messages.map((message) => message.serialize()),
      };

      return res.json(response);
    } catch (err) {
      display.warning.nextLine('APIv1:logsRouter:messages[get]', err);
      return res.sendStatus(400);
    }
  });

  return logsRouter;
};
