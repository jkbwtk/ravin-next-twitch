import { arrayFrom } from '#lib/utils';
import { SocketServer } from '#server/SocketServer';
import { SystemNotification } from '#shared/types/api/systemNotifications';
import { Prisma } from '@prisma/client';
import { z } from 'zod';


export const systemNotificationCreateInput = z.object({
  id: z.number().optional(),
  title: z.string(),
  content: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  userId: z.string(),
}) satisfies z.Schema<Prisma.SystemNotificationUncheckedCreateInput>;

export const systemNotificationExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      systemNotification: {
        async validate(config: Prisma.SystemNotificationUncheckedCreateInput) {
          return systemNotificationCreateInput.safeParseAsync(config);
        },
      },
    },
    result: {
      systemNotification: {
        serialize: {
          needs: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            deletedAt: true,
            userId: true,
          },
          compute(notification) {
            return (): SystemNotification => {
              return {
                id: notification.id,
                userId: notification.userId,
                title: notification.title,
                content: notification.content,
                read: notification.deletedAt !== null,
                createdAt: notification.createdAt,
              };
            };
          },
        },
      },
    },
    query: {
      systemNotification: {
        async create({ args, query }) {
          args.data = await systemNotificationCreateInput.parseAsync(args.data);
          return query(args);
        },
        async update({ args, query }) {
          args.data = await systemNotificationCreateInput.partial().parseAsync(args.data);
          return query(args);
        },
      },
    },
  }).$extends({
    model: {
      systemNotification: {
        async createNotification(userId: string, title: string, content: string) {
          const notification = await Prisma.getExtensionContext(this).create({
            data: {
              title: title,
              content: content,
              userId: userId,
            },
          });

          SocketServer.emitToUser(userId, 'NEW_SYSTEM_NOTIFICATION', notification.serialize());
          return notification;
        },
        async broadcastNotification(title: string, content: string) {
          const users = await client.user.findMany();

          const notifications = await Promise.all(users.map(async (user) => {
            return Prisma.getExtensionContext(this).create({
              data: {
                title: title,
                content: content,
                userId: user.id,
              },
            });
          }));

          for (const notification of notifications) {
            SocketServer.emitToUser(notification.userId, 'NEW_SYSTEM_NOTIFICATION', notification.serialize());
          }
        },
        async getByUserId(userId: string) {
          return Prisma.getExtensionContext(this).findMany({
            where: {
              userId: userId,
            },
            include: {
              user: true,
            },
          });
        },
        async getById(id: number) {
          return Prisma.getExtensionContext(this).findFirst({
            where: {
              id: id,
            },
            include: {
              user: true,
            },
          });
        },
        async markAsReadById(id: number | number[]) {
          return Prisma.getExtensionContext(this).updateMany({
            where: {
              id: {
                in: arrayFrom(id),
              },
            },
            data: {
              deletedAt: new Date(),
            },
          });
        },
        async markAsReadByUserId(userId: string) {
          return client.$transaction(async (prisma) => {
            const targets = await prisma.systemNotification.findMany({
              where: {
                userId: userId,
                deletedAt: null,
              },
              select: {
                id: true,
              },
            });

            if (targets.length === 0) return;

            return prisma.systemNotification.updateMany({
              where: {
                id: {
                  in: targets.map((target) => target.id),
                },
              },
              data: {
                deletedAt: new Date(),
              },
            });
          }, {
            isolationLevel: 'Serializable',
          });
        },
        async getDeletedByUserId(userId: string) {
          return Prisma.getExtensionContext(this).findMany({
            where: {
              userId: userId,
              deletedAt: {
                not: null,
              },
            },
            include: {
              user: true,
            },
          });
        },
      },
    },
  });
});
