import { SocketServer } from '#server/SocketServer';
import { Action } from '#shared/types/api/dashboard';
import { ChannelActionType, Prisma } from '@prisma/client';
import { z } from 'zod';


export const channelActionCreateInput = z.object({
  id: z.number().optional(),
  issuerDisplayName: z.string(),
  targetDisplayName: z.string(),
  type: z.enum([ChannelActionType.ban, ChannelActionType.timeout, ChannelActionType.delete]),
  data: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  channelUserId: z.string(),
}) satisfies z.Schema<Prisma.ChannelActionUncheckedCreateInput>;

export const channelActionExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      channelAction: {
        serialize: {
          needs: {
            id: true,
            channelUserId: true,
            issuerDisplayName: true,
            targetDisplayName: true,
            type: true,
            data: true,
            createdAt: true,
          },
          compute(action) {
            return (): Action => {
              const type = action.type;
              const date = action.createdAt.getTime();
              const issuerDisplayName = action.issuerDisplayName;
              const targetDisplayName = action.targetDisplayName;

              switch (type) {
                case 'ban':
                  return {
                    date,
                    issuerDisplayName,
                    targetDisplayName,
                    type,
                    reason: action.data,
                  };

                case 'timeout':
                  return {
                    date,
                    issuerDisplayName,
                    targetDisplayName,
                    type,
                    duration: parseInt(action.data, 10),
                  };

                default:
                  return {
                    date,
                    issuerDisplayName,
                    targetDisplayName,
                    type: 'delete',
                    message: action.data,
                  };
              }
            };
          },
        },
      },
    },
    model: {
      channelAction: {
        async validate(action: Prisma.ChannelActionUncheckedCreateInput) {
          return channelActionCreateInput.safeParseAsync(action);
        },
      },
    },
  }).$extends({
    query: {
      channelAction: {
        async create({ args, query }) {
          args.data = await channelActionCreateInput.parseAsync(args.data);
          return query(args);
        },
      },
    },
  }).$extends({
    model: {
      channelAction: {
        async createAndEmit(action: Prisma.ChannelActionUncheckedCreateInput) {
          const created = await Prisma.getExtensionContext(this).create({ data: action });

          SocketServer.emitToUser(created.channelUserId, 'NEW_RECENT_ACTION', created.serialize());

          return created;
        },

        async getByUserId(userId: string) {
          return await Prisma.getExtensionContext(this).findMany({
            where: {
              channelUserId: userId,
            },
          });
        },
      },
    },
  });
});
