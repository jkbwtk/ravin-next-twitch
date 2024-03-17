import { Bot } from '#bot/Bot';
import { ExtensionReturnType, ExtensionType } from '#database/extensions/utils';
import { logger } from '#lib/logger';
import { LimitOffsetPaginationState } from '#server/middlewares/pagination';
import { CustomCommand, DeleteCustomCommandReqBody, PatchCustomCommandReqBody, PostCustomCommandReqBody, UserLevel } from '#shared/types/api/commands';
import { Prisma } from '@prisma/client';


declare global {
  namespace PrismaJson {
    type UserLevelPrisma = UserLevel;
  }
}

export type CommandWithUserAndTemplate = ExtensionReturnType<ExtensionType<
  typeof commandExtension
>['model']['command']['getById']>;

export const commandExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      command: {
        serialize: {
          needs: {
            id: true,
            channelUserId: true,
            command: true,
            templateId: true,
            userLevel: true,
            cooldown: true,
            enabled: true,
          },
          compute(command) {
            return (): CustomCommand => {
              return {
                id: command.id,
                channelId: command.channelUserId,
                command: command.command,
                templateId: command.templateId,
                userLevel: command.userLevel,
                cooldown: command.cooldown,
                enabled: command.enabled,
              };
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      command: {
        async getById(id: number) {
          return Prisma.getExtensionContext(this).findFirst({
            where: { id },
            include: {
              user: true,
              template: true,
            },
          });
        },
        async getByChannelId(channelId: string, pagination: LimitOffsetPaginationState = null) {
          return Prisma.getExtensionContext(this).findMany({
            where: { channelUserId: channelId },
            include: {
              user: true,
              template: true,
            },

            ...pagination,
          });
        },
        async countByChannelId(channelId: string) {
          return Prisma.getExtensionContext(this).count({
            where: { channelUserId: channelId },
          });
        },
        async incrementUsage(id: number) {
          await Prisma.getExtensionContext(this).update({
            where: { id },
            data: {
              usage: {
                increment: 1,
              },
            },
          });
        },
        async getTopCommand(channelId: string) {
          return Prisma.getExtensionContext(this).findFirst({
            where: { channelUserId: channelId },
            orderBy: {
              usage: 'desc',
            },
            include: {
              user: true,
              template: true,
            },
          });
        },
        async createFromApi(channelId: string, command: PostCustomCommandReqBody) {
          const result = await Prisma.getExtensionContext(this).create({
            data: {
              channelUserId: channelId,
              command: command.command,
              templateId: command.templateId,
              userLevel: command.userLevel,
              cooldown: command.cooldown,
              enabled: command.enabled,
            },
            include: {
              user: true,
              template: true,
            },
          });

          await Bot.reloadChannelCommands(result.channelUserId);

          return result;
        },
        async updateFromApi(command: PatchCustomCommandReqBody) {
          const result = await Prisma.getExtensionContext(this).update({
            where: { id: command.id },
            data: {
              command: command.command,
              templateId: command.templateId,
              userLevel: command.userLevel,
              cooldown: command.cooldown,
              enabled: command.enabled,
            },
            include: {
              user: true,
              template: true,
            },
          });

          await Bot.reloadChannelCommands(result.channelUserId);

          return result;
        },
        async deleteFromApi(command: DeleteCustomCommandReqBody) {
          return Prisma.getExtensionContext(this).delete({
            where: { id: command.id },
          });
        },
      },
    },
  });
});
