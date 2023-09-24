import { Bot } from '#bot/Bot';
import { ExtensionReturnType, ExtensionType } from '#database/extensions/utils';
import { logger } from '#lib/logger';
import { CustomCommand, DeleteCustomCommandRequest, PatchCustomCommandRequest, PostCustomCommandRequest, UserLevel } from '#shared/types/api/commands';
import { Prisma } from '@prisma/client';


declare global {
  namespace PrismaJson {
    type UserLevelPrisma = UserLevel;
  }
}

export type CommandWithUser = ExtensionReturnType<ExtensionType<
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
            response: true,
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
                response: command.response,
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
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findFirst({
            where: { id },
            include: {
              user: true,
            },
          });

          logger.time('Getting command by id', t1);

          return result;
        },
        async getByChannelId(channelId: string) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findMany({
            where: { channelUserId: channelId },
            include: {
              user: true,
            },
          });

          logger.time('Getting commands by channel id', t1);

          return result;
        },
        async incrementUsage(id: number) {
          const t1 = performance.now();

          await Prisma.getExtensionContext(this).update({
            where: { id },
            data: {
              usage: {
                increment: 1,
              },
            },
          });

          logger.time('Incrementing command usage', t1);
        },
        async getTopCommand(channelId: string) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findFirst({
            where: { channelUserId: channelId },
            orderBy: {
              usage: 'desc',
            },
            include: {
              user: true,
            },
          });

          logger.time('Getting top command', t1);

          return result;
        },
        async createFromApi(channelId: string, command: PostCustomCommandRequest) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).create({
            data: {
              channelUserId: channelId,
              command: command.command,
              response: command.response,
              userLevel: command.userLevel,
              cooldown: command.cooldown,
              enabled: command.enabled,
            },
            include: {
              user: true,
            },
          });

          logger.time('Creating command from api', t1);

          await Bot.reloadChannelCommands(result.channelUserId);

          return result;
        },
        async updateFromApi(command: PatchCustomCommandRequest) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).update({
            where: { id: command.id },
            data: {
              command: command.command,
              response: command.response,
              userLevel: command.userLevel,
              cooldown: command.cooldown,
              enabled: command.enabled,
            },
            include: {
              user: true,
            },
          });

          logger.time('Updating command from api', t1);

          await Bot.reloadChannelCommands(result.channelUserId);

          return result;
        },
        async deleteFromApi(command: DeleteCustomCommandRequest) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).delete({
            where: { id: command.id },
          });

          logger.time('Deleting command from api', t1);

          return result;
        },
      },
    },
  });
});
