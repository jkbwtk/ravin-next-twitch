import { db } from '#database/database';
import { convertToControllerProxy } from '#database/utils';
import { ExtendedMap } from '#lib/ExtendedMap';
import { channelStatsTable } from '#schema/schema';
import { ChannelStat } from '#types/database/tables';
import { and, desc, eq, getTableColumns, gte, lte, sql, SQL } from 'drizzle-orm';


export const FRAME_DURATION = 60_000;

const ChannelStatsControllerProperties = {
  $utils: {
    mapFrames(frames: ChannelStat[]): ExtendedMap<number, ChannelStat> {
      const mapped = new ExtendedMap<number, ChannelStat>();
      for (const frame of frames) {
        mapped.set(frame.frameId, frame);
      }

      return mapped;
    },

    frameIdFromDate(date = new Date()): number {
      return Math.floor(date.getTime() / FRAME_DURATION);
    },

    dateFromFrameId(frameId: number): Date {
      return new Date(frameId * FRAME_DURATION);
    },

    getDate(frame: ChannelStat): Date {
      return new Date(frame.frameId * FRAME_DURATION);
    },
  },
};

const incrementQueryBuilder = (column: keyof ChannelStat, userId: string, frameId: number) => {
  return db
    .insert(channelStatsTable)
    .values({
      channelUserId: userId,
      frameId,
      [column]: 1,
    })
    .onConflictDoUpdate({
      target: [channelStatsTable.channelUserId, channelStatsTable.frameId],
      set: {
        [column]: sql`${channelStatsTable[column]} + 1`,
      },
    }).returning(getTableColumns(channelStatsTable));
};

const ChannelStatsControllerMethods = {
  async getFrame(userId: string, frameId: number): Promise<ChannelStat | null> {
    const filters: SQL[] = [
      eq(channelStatsTable.channelUserId, userId),
      eq(channelStatsTable.frameId, frameId),
    ];

    const query = db
      .query
      .channelStatsTable
      .findFirst({
        where: and(...filters),
      });

    const result = await query;

    return result ?? null;
  },

  async getFrames(userId: string, limit = 60): Promise<ChannelStat[]> {
    const query = db
      .query
      .channelStatsTable
      .findMany({
        where: eq(channelStatsTable.channelUserId, userId),
        orderBy: desc(channelStatsTable.frameId),

        limit,
      });

    const result = await query;

    return result;
  },

  async getFramesBetween(userId: string, oldestFrameId: number, newestFrameId: number): Promise<ChannelStat[]> {
    const filters: SQL[] = [
      eq(channelStatsTable.channelUserId, userId),
      gte(channelStatsTable.frameId, oldestFrameId),
      lte(channelStatsTable.frameId, newestFrameId),
    ];

    const query = db
      .query
      .channelStatsTable
      .findMany({
        where: and(...filters),
        orderBy: desc(channelStatsTable.frameId),
      });

    const result = await query;

    return result;
  },

  async incrementMessages(userId: string): Promise<ChannelStat | null> {
    const frameId = ChannelStatsControllerProperties.$utils.frameIdFromDate();
    const query = incrementQueryBuilder('messages', userId, frameId);

    const result = await query;

    return result.at(0) ?? null;
  },

  async incrementTimeouts(userId: string): Promise<ChannelStat | null> {
    const frameId = ChannelStatsControllerProperties.$utils.frameIdFromDate();
    const query = incrementQueryBuilder('timeouts', userId, frameId);

    const result = await query;

    return result.at(0) ?? null;
  },

  async incrementBans(userId: string): Promise<ChannelStat | null> {
    const frameId = ChannelStatsControllerProperties.$utils.frameIdFromDate();
    const query = incrementQueryBuilder('bans', userId, frameId);

    const result = await query;

    return result.at(0) ?? null;
  },

  async incrementDeleted(userId: string): Promise<ChannelStat | null> {
    const frameId = ChannelStatsControllerProperties.$utils.frameIdFromDate();
    const query = incrementQueryBuilder('deleted', userId, frameId);

    const result = await query;

    return result.at(0) ?? null;
  },

  async incrementCommands(userId: string): Promise<ChannelStat | null> {
    const frameId = ChannelStatsControllerProperties.$utils.frameIdFromDate();
    const query = incrementQueryBuilder('commands', userId, frameId);

    const result = await query;

    return result.at(0) ?? null;
  },
};

export const ChannelStatsController = convertToControllerProxy(
  'ChannelStatsController',
  ChannelStatsControllerMethods,
  ChannelStatsControllerProperties,
);
