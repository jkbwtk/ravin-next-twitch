import { ExtendedMap } from '#lib/ExtendedMap';
import { display } from '#lib/display';
import { ChannelStats, Prisma } from '@prisma/client';
import { z } from 'zod';


export const FRAME_DURATION = 60_000;

export const channelStatsCreateInput = z.object({
  id: z.number().min(1).optional(),
  frameId: z.number().int().min(0),
  messages: z.number().int().min(0).optional(),
  timeouts: z.number().int().min(0).optional(),
  bans: z.number().int().min(0).optional(),
  deleted: z.number().int().min(0).optional(),
  commands: z.number().int().min(0).optional(),
  frameDuration: z.number().int().min(0).optional(),
  createdAt: z.date().optional().optional(),
  updatedAt: z.date().optional().optional(),
  userId: z.string(),
}) satisfies z.Schema<Prisma.ChannelStatsUncheckedCreateInput>;

export const channelStatsExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      channelStats: {
        async create({ args, query }) {
          args.data = await channelStatsCreateInput.parseAsync(args.data);
          return query(args);
        },
      },
    },
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
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findMany({
            where: { userId },
            orderBy: {
              frameId: 'desc',
            },
            take: limit,
            include: {
              user: true,
            },
          });

          display.time('Getting channelStats frames', t1);

          return result;
        },
        async getFrame(userId: string, frameId: number) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findFirst({
            where: {
              userId, frameId,
            },
            include: {
              user: true,
            },
          });

          display.time('Getting channelStats frame', t1);

          return result;
        },
        async getLatestFrame(userId: string) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findFirst({
            where: { userId },
            orderBy: {
              frameId: 'desc',
            },
            include: {
              user: true,
            },
          });

          display.time('Getting channelStats latest frame', t1);

          return result;
        },
        async getFramesBetween(userId: string, start: Date | number, end: Date | number = new Date()) {
          const startFrameId = typeof start === 'number' ? start : Prisma.getExtensionContext(this).frameIdFromDate(start);
          const endFrameId = typeof end === 'number' ? end : Prisma.getExtensionContext(this).frameIdFromDate(end);

          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findMany({
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

          display.time('Getting channelStats between dates', t1);

          return result;
        },
        async incrementMessages(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          const t1 = performance.now();

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

          display.time('Incrementing messages in channelStats', t1);
        },
        async incrementTimeouts(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          const t1 = performance.now();

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

          display.time('Incrementing timeouts in channelStats', t1);
        },
        async incrementBans(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          const t1 = performance.now();

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

          display.time('Incrementing bans in channelStats', t1);
        },
        async incrementDeleted(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          const t1 = performance.now();

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

          display.time('Incrementing deleted in channelStats', t1);
        },
        async incrementCommands(userId: string) {
          const frameId = Prisma.getExtensionContext(this).frameIdFromDate();

          const t1 = performance.now();

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

          display.time('Incrementing commands in channelStats', t1);
        },
      },
    },
  });
});
