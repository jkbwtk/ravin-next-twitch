import { LimitOffsetPaginationState } from '#server/middlewares/pagination';
import { Prisma } from '@prisma/client';
import { BotAction, BotActionData, BotActionType, BotActionTypeParams } from '#types/api/botActions';
import { SocketServer } from '#server/SocketServer';


declare global {
  namespace PrismaJson {
    type BotActionDataPrisma = BotActionData;
  }
}

export const botActionExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      botAction: {
        serialize: {
          needs: {
            id: true,
            type: true,
            data: true,
            createdAt: true,
          },
          compute(action) {
            return (): BotAction => {
              return {
                id: action.id,
                type: action.type,
                data: action.data,
                timestamp: action.createdAt.getTime(),
              };
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      botAction: {
        async getById(id: number) {
          return Prisma.getExtensionContext(this).findFirst({
            where: { id },
            include: {
              user: true,
            },
          });
        },
        async getByChannelId(channelId: string, pagination: LimitOffsetPaginationState = null) {
          return Prisma.getExtensionContext(this).findMany({
            where: { channelUserId: channelId },
            include: {
              user: true,
            },

            ...pagination,
          });
        },
        async countByChannelId(channelId: string) {
          return Prisma.getExtensionContext(this).count({
            where: { channelUserId: channelId },
          });
        },

        async createAndEmit<T extends BotActionType>(channelUserId: string, type: T, ...data: Parameters<BotActionTypeParams[T]>) {
          const result = await Prisma.getExtensionContext(this).create({
            data: {
              channelUserId,
              type,
              data: BotActionData.parse(data),
            },
          });

          SocketServer.emitToUser(channelUserId, 'NEW_BOT_ACTION', result.serialize());

          return result;
        },
      },
    },
  });
});
