import { arrayFrom } from '#lib/utils';
import { SocketServer } from '#server/SocketServer';
import { SystemNotification } from '#shared/types/api/systemNotifications';
import { Prisma } from '@prisma/client';


export const systemNotificationExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      systemNotification: {
        serialize: {
          needs: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            readAt: true,
            userId: true,
          },
          compute(notification) {
            return (): SystemNotification => {
              return {
                id: notification.id,
                userId: notification.userId,
                title: notification.title,
                content: notification.content,
                read: notification.readAt !== null,
                createdAt: notification.createdAt,
              };
            };
          },
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
              readAt: new Date(),
            },
          });
        },
        async markAsReadByUserId(userId: string) {
          return client.$transaction(async (prisma) => {
            const targets = await prisma.systemNotification.findMany({
              where: {
                userId: userId,
                readAt: null,
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
                readAt: new Date(),
              },
            });
          }, {
            isolationLevel: 'Serializable',
          });
        },
        async getReadByUserId(userId: string) {
          return Prisma.getExtensionContext(this).findMany({
            where: {
              userId: userId,
              readAt: {
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
