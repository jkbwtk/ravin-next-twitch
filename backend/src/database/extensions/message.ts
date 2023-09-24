import { ExtensionType } from '#database/extensions/utils';
import { logger } from '#lib/logger';
import { definedOrFail } from '#lib/utils';
import { UserLevel } from '#shared/types/api/commands';
import { EmotesUsed as EmotesUsed, Message as MessagePublic } from '#shared/types/api/logs';
import { Message, Prisma } from '@prisma/client';
import { BadgeInfo, Badges, ChatUserstate } from 'tmi.js';


declare global {
  namespace PrismaJson {
    type EmotesUsedPrisma = EmotesUsed;
    type BadgesPrisma = Badges;
    type BadgeInfoPrisma = BadgeInfo;
    type MessagePrisma = Exclude<ChatUserstate['message-type'], undefined>;
  }
}

export type EmotesRaw = {
  [id: string]: string[]
};

export type DatabaseEmote = {
  id: string;
  name: string;
  count: bigint;
};

export type MessageWithUser = Awaited<ReturnType<ReturnType<ExtensionType<
  typeof messageExtension
>['model']['message']['createFromChatUserState']>>>;

export const messageExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      message: {
        serialize: {
          needs: {
            uuid: true,
            channelUserId: true,
            channelName: true,
            color: true,
            userId: true,
            displayName: true,
            emotes: true,
            content: true,
            timestamp: true,
          },
          compute(message) {
            return (): MessagePublic => {
              return {
                id: message.uuid,
                channelId: message.channelUserId,
                channelName: message.channelName,
                color: message.color,
                userId: message.userId,
                displayName: message.displayName,
                emotes: message.emotes,
                content: message.content,
                timestamp: message.timestamp.getTime(),
              };
            };
          },
        },
        getUserLevel: {
          needs: {
            badges: true,
            mod: true,
            subscriber: true,
          },
          compute(message) {
            return (): UserLevel => {
              if (message.badges?.broadcaster) return UserLevel.Owner;
              if (message.mod) return UserLevel.Moderator;
              if (message.badges?.vip) return UserLevel.VIP;
              if (message.subscriber) return UserLevel.Subscriber;

              return UserLevel.Everyone;
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      message: {
        getEmotesUsed(message: string, emotes: EmotesRaw | null | undefined): EmotesUsed | null {
          if (emotes === null || emotes === undefined) return null;
          const result: EmotesUsed = {};

          for (const [id, positions] of Object.entries(emotes)) {
            const position = positions[0];
            if (position === undefined) return null;

            const [start, end] = position.split('-').map((x) => parseInt(x, 10));
            if (start === undefined || end === undefined) return null;

            const name = message.substring(start, end + 1);
            if (name.length === 0) return null;

            result[id] = {
              name,
              count: positions.length,
              positions,
            };
          }

          return result;
        },
      },
    },
  }).$extends({
    model: {
      message: {
        async createFromChatUserState(channel: string, userState: ChatUserstate, content: string) {
          return await Prisma.getExtensionContext(this).create({
            data: {
              uuid: definedOrFail(userState.id, 'id'),
              channelName: channel,
              channelUserId: definedOrFail(userState['room-id'], 'room-id'),
              username: definedOrFail(userState.username, 'username'),
              displayName: definedOrFail(userState['display-name'], 'display-name'),
              color: userState.color,
              userId: definedOrFail(userState['user-id'], 'user-id'),
              content,
              emotes: Prisma.getExtensionContext(this).getEmotesUsed(content, userState.emotes) ?? undefined,
              timestamp: userState['tmi-sent-ts'] ? new Date(parseInt(userState['tmi-sent-ts'], 10)) : new Date(),
              badgeInfo: userState.badgeInfo,
              badges: userState.badges,
              flags: userState.flags,
              messageType: definedOrFail(userState['message-type'], 'message-type'),
              firstMessage: userState['first-msg'] ?? false,
              mod: userState.mod ?? false,
              subscriber: userState.subscriber ?? false,
            },
            include: {
              user: true,
            },
          });
        },
        async getByChannelId(channelId: string, limit = 1000) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findMany({
            where: {
              channelUserId: channelId,
            },
            orderBy: {
              timestamp: 'desc',
            },
            take: limit,
            include: {
              user: true,
            },
          });

          logger.time('Getting messages by channel id', t1);

          return result;
        },
        async getTopChatter(channelId: string): Promise<string | null> {
          try {
            const t1 = performance.now();

            const result = await client.$queryRaw<(Pick<Message, 'userId'> & { count: bigint })[]>`
            SELECT "userId", COUNT(*) AS "count"
            FROM "Message"
            WHERE "channelUserId" = ${channelId}
            GROUP BY "userId"
            ORDER BY "count" DESC
            LIMIT 1
            `;

            logger.time('Getting top chatter', t1);

            return result[0]?.userId ?? null;
          } catch (err) {
            logger.error('Failed to get top chatter for channel [%s]', channelId, {
              label: ['Message', 'getTopChatter'],
              error: err,
            });

            return null;
          }
        },
        async getTopEmote(channelId: string): Promise<DatabaseEmote | null> {
          try {
            const t1 = performance.now();

            const result = await client.$queryRaw<DatabaseEmote[]>`
            SELECT "id", "name", SUM("count") AS "count"
            FROM (SELECT "emote".key AS "id", "name", "count"::INTEGER
                  FROM "Message"
                          CROSS JOIN LATERAL JSONB_EACH("Message"."emotes") AS "emote"
                          CROSS JOIN LATERAL jsonb_object_field_text("emote".value, 'name') AS "name"
                          CROSS JOIN LATERAL jsonb_object_field_text("emote".value, 'count') AS "count"
                  WHERE "channelUserId" = ${channelId}
                    AND "Message"."emotes" IS NOT NULL) AS "emotes"
            GROUP BY "id", NAME
            ORDER BY "count" DESC
            LIMIT 1;
            `;

            logger.time('Getting top emote', t1);

            return result[0] ?? null;
          } catch (err) {
            logger.error('Failed to get top emote for channel [%s]', channelId, {
              label: ['Message', 'getTopEmote'],
              error: err,
            });

            return null;
          }
        },
      },
    },
  });
});
