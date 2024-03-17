import { ExtendedMap } from '#lib/ExtendedMap';
import { logger } from '#lib/logger';
import { ChannelStats, Prisma } from '@prisma/client';


export const FRAME_DURATION = 60_000;

export const channelStatsExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      channelStats: {
        mapFrames<T extends ChannelStats>(frames: T[]): ExtendedMap<number, T> {
          const mapped = new ExtendedMap<number, T>();
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
      },
    },
    result: {
      channelStats: {
        getDate: {
          needs: {
            frameId: true,
          },
          compute(frame) {
            return (): Date => {
              return new Date(frame.frameId * FRAME_DURATION);
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      channelStats: {
        async getFrames(userId: string, limit = 60) {
          return Prisma.getExtensionContext(this).findMany({
            where: { userId },
            orderBy: {
              frameId: 'desc',
            },
            take: limit,
            include: {
              user: true,
            },
          });
        },
        async getFrame(userId: string, frameId: number) {
          return Prisma.getExtensionContext(this).findFirst({
            where: {
              userId, frameId,
            },
            include: {
              user: true,
            },
          });
        },
        async getLatestFrame(userId: string) {
          return Prisma.getExtensionContext(this).findFirst({
            where: { userId },
            orderBy: {
              frameId: 'desc',
            },
            include: {
              user: true,
            },
          });
        },
        async getFramesBetween(userId: string, start: Date | number, end: Date | number = new Date()) {
          const startFrameId = typeof start === 'number' ? start : Prisma.getExtensionContext(this).frameIdFromDate(start);
          const endFrameId = typeof end === 'number' ? end : Prisma.getExtensionContext(this).frameIdFromDate(end);

          return Prisma.getExtensionContext(this).findMany({
            where: {
              userId,
              frameId: {
                gte: startFrameId,
                lte: endFrameId,
              },
            },
            orderBy: {
              frameId: 'desc',
            },
            include: {
              user: true,
            },
          });
        },
        async incrementMessages(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          await Prisma.getExtensionContext(this).upsert({
            update: {
              messages: {
                increment: 1,
              },
            },
            where: { userId_frameId: { userId, frameId } },
            create: {
              userId,
              frameId,
              messages: 1,
            },
          });
        },
        async incrementTimeouts(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          await Prisma.getExtensionContext(this).upsert({
            update: {
              timeouts: {
                increment: 1,
              },
            },
            where: { userId_frameId: { userId, frameId } },
            create: {
              userId,
              frameId,
              timeouts: 1,
            },
          });
        },
        async incrementBans(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          await Prisma.getExtensionContext(this).upsert({
            update: {
              bans: {
                increment: 1,
              },
            },
            where: { userId_frameId: { userId, frameId } },
            create: {
              userId,
              frameId,
              bans: 1,
            },
          });
        },
        async incrementDeleted(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          await Prisma.getExtensionContext(this).upsert({
            update: {
              deleted: {
                increment: 1,
              },
            },
            where: { userId_frameId: { userId, frameId } },
            create: {
              userId,
              frameId,
              deleted: 1,
            },
          });
        },
        async incrementCommands(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          await Prisma.getExtensionContext(this).upsert({
            update: {
              commands: {
                increment: 1,
              },
            },
            where: { userId_frameId: { userId, frameId } },
            create: {
              userId,
              frameId,
              commands: 1,
            },
          });
        },
      },
    },
  });
});
