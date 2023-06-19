import { display } from '#lib/display';
import { definedOrFail } from '#lib/utils';
import { UserLevel } from '#shared/types/api/commands';
import { EmotesUsed as EmotesUsed, Message as MessagePublic } from '#shared/types/api/logs';
import { Message, Prisma } from '@prisma/client';
import { BadgeInfo, Badges, ChatUserstate } from 'tmi.js';
import { z } from 'zod';


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

const messageWithUser = Prisma.validator<Prisma.MessageArgs>()({
  include: {
    user: true,
  },
});

export type MessageWithUser = Prisma.MessageGetPayload<typeof messageWithUser>;

export const messageCreateInput = z.object({
  id: z.number().optional(),
  uuid: z.string().uuid(),
  channelName: z.string(),
  channelUserId: z.string(),
  username: z.string(),
  displayName: z.string(),
  color: z.string().nullable().optional(),
  userId: z.string(),
  content: z.string(),
  emotes: z.record(
    z.string(),
    z.object({
      name: z.string(),
      count: z.number(),
      positions: z.array(z.string()),
    }),
  ).optional(),
  timestamp: z.date(),
  badgeInfo: z.record(z.string(), z.string().optional()).optional(),
  badges: z.record(z.string(), z.string().optional()).optional(),
  flags: z.string().nullable(),
  messageType: z.enum(['chat', 'action', 'whisper']),
  firstMessage: z.boolean(),
  mod: z.boolean(),
  subscriber: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
}) satisfies z.Schema<Prisma.MessageUncheckedCreateInput>;


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

          display.time('Getting messages by channel id', t1);

          return result;
        },
        async getTopChatter(channelId: string): Promise<string | null> {
          try {
            const t1 = performance.now();

            const result = await client.$queryRaw<(Pick<Message, 'userId'> & { count: bigint })[]>`--sql
            SELECT "userId", COUNT(*) AS "count"
            FROM message
            WHERE "channelUserId" = ${channelId}
            GROUP BY "userId"
            ORDER BY "count" DESC
            LIMIT 1
            `;

            display.time('Getting top chatter', t1);

            return result[0]?.userId ?? null;
          } catch (err) {
            display.error.nextLine('Message:getTopChatter', err);

            return null;
          }
        },
        async getTopEmote(channelId: string): Promise<DatabaseEmote | null> {
          try {
            const t1 = performance.now();

            const result = await client.$queryRaw<DatabaseEmote[]>`--sql
            SELECT "id", "name", SUM("count") AS "count"
            FROM (SELECT "emote".key AS "id", "name", "count"::INTEGER
                  FROM message
                          CROSS JOIN LATERAL JSONB_EACH(message."emotes") AS "emote"
                          CROSS JOIN LATERAL jsonb_object_field_text("emote".value, 'name') AS "name"
                          CROSS JOIN LATERAL jsonb_object_field_text("emote".value, 'count') AS "count"
                  WHERE "channelUserId" = ${channelId}
                    AND MESSAGE."emotes" IS NOT NULL) AS "emotes"
            GROUP BY "id", NAME
            ORDER BY "count" DESC
            LIMIT 1;
            `;

            display.time('Getting top emote', t1);

            return result[0] ?? null;
          } catch (err) {
            display.error.nextLine('Message:getTopEmote', err);

            return null;
          }
        },
      },
    },
    query: {
      message: {
        async create({ args, query }) {
          args.data = await messageCreateInput.parseAsync(args.data);
          return query(args);
        },
        async update({ args, query }) {
          args.data = await messageCreateInput.partial().parseAsync(args.data);
          return query(args);
        },
      },
    },
  });
});
