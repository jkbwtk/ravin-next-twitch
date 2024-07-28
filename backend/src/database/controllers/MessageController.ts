import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD, SelectOptions } from '#database/utils';
import { definedOrFail } from '#lib/utils';
import { messagesTable } from '#schema/schema';
import { UserLevel } from '#types/api/commands';
import { EmotesUsed } from '#types/api/message';
import { Message, MessageCreate } from '#types/database/tables';
import { and, asc, count, desc, eq, inArray, sql, SQL } from 'drizzle-orm';
import { ChatUserstate } from 'tmi.js';


export type DatabaseEmote = {
  id: string;
  name: string;
  count: bigint;
};

const getEmotesUsed = (message: string, emotes: ChatUserstate['emotes']): EmotesUsed | null => {
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
};

const MessageControllerProperties = {
  $utils: {
    getUserLevel(message: Message): UserLevel {
      if (message.badges?.broadcaster) return UserLevel.Owner;
      if (message.mod) return UserLevel.Moderator;
      if (message.badges?.vip) return UserLevel.VIP;
      if (message.subscriber) return UserLevel.Subscriber;

      return UserLevel.Everyone;
    },

    convertFromChatMessage(channel: string, chatMessage: ChatUserstate, content: string): MessageCreate {
      return {
        uuid: definedOrFail(chatMessage.id, 'id'),
        channelName: channel,
        channelUserId: definedOrFail(chatMessage['room-id'], 'room-id'),
        username: definedOrFail(chatMessage.username, 'username'),
        displayName: definedOrFail(chatMessage['display-name'], 'display-name'),
        color: chatMessage.color,
        userId: definedOrFail(chatMessage['user-id'], 'user-id'),
        content,
        emotes: getEmotesUsed(content, chatMessage.emotes) ?? undefined,
        timestamp: chatMessage['tmi-sent-ts'] ? new Date(parseInt(chatMessage['tmi-sent-ts'], 10)) : new Date(),
        badgeInfo: chatMessage.badgeInfo,
        badges: chatMessage.badges,
        flags: chatMessage.flags,
        messageType: definedOrFail(chatMessage['message-type'], 'message-type'),
        firstMessage: chatMessage['first-msg'] ?? false,
        mod: chatMessage.mod ?? false,
        subscriber: chatMessage.subscriber ?? false,
      };
    },
  },
};

const MessageControllerMethods = {
  ...createBasicCRUD(messagesTable),

  async getByUserId(userId: string, options: SelectOptions = {}) {
    const filters: SQL[] = [
      eq(messagesTable.channelUserId, userId),
    ];

    const orderBy: SQL[] = [];

    if (options.idListFilter) {
      filters.push(inArray(messagesTable.id, options.idListFilter.id.in));
    }

    if (options.orderBy) {
      for (const [column, direction] of Object.entries(options.orderBy)) {
        const method = direction === 'asc' ? asc : desc;
        orderBy.push(method(messagesTable[column as keyof Message]));
      }
    }

    const query = db
      .query
      .messagesTable
      .findMany({
        where: and(...filters),
        orderBy,

        ...options.pagination,
      });

    const result = await query;

    return result ?? [];
  },

  async countByUserId(userId: string): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(messagesTable)
      .where(eq(messagesTable.channelUserId, userId));

    const result = await query;

    return result.at(0)?.count ?? 0;
  },

  async getTopChatter(userId: string): Promise<string | null> {
    const query = db
      .select({ userId: messagesTable.userId, count: count() })
      .from(messagesTable)
      .where(eq(messagesTable.channelUserId, userId))
      .groupBy(messagesTable.userId)
      .orderBy(({ count }) => desc(count))
      .limit(1);

    const result = await query;

    return result.at(0)?.userId ?? null;
  },

  async getTopEmote(userId: string): Promise<DatabaseEmote | null> {
    const query = db
      .execute<DatabaseEmote>(sql`
            SELECT "id", "name", SUM("count")::INTEGER AS "count"
            FROM (SELECT "emote".key AS "id", "name", "count"::INTEGER
                  FROM ${messagesTable}
                          CROSS JOIN LATERAL JSONB_EACH(${messagesTable.emotes}) AS "emote"
                          CROSS JOIN LATERAL jsonb_object_field_text("emote".value, 'name') AS "name"
                          CROSS JOIN LATERAL jsonb_object_field_text("emote".value, 'count') AS "count"
                  WHERE "channelUserId" = ${userId}
                    AND ${messagesTable.emotes} IS NOT NULL) AS "emotes"
            GROUP BY "id", NAME
            ORDER BY "count" DESC
            LIMIT 1;
        `);

    const result = await query;

    return result.rows[0] ?? null;
  },
};

export const MessageController = convertToControllerProxy(
  'MessageController',
  MessageControllerMethods,
  MessageControllerProperties,
);

