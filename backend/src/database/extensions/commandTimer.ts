import { CommandTimer, DeleteCommandTimerReqBody, PatchCommandTimerReqBody, PostCommandTimerReqBody } from '#shared/types/api/commands';
import { ExtensionReturnType, ExtensionType } from '#database/extensions/utils';
import { Prisma } from '@prisma/client';
import { Bot } from '#bot/Bot';
import { LimitOffsetPaginationState } from '#server/middlewares/pagination';
import { idListFilterState } from '#server/middlewares/idListFilter';


export type CommandTimerWithUser = ExtensionReturnType<ExtensionType<
  typeof commandTimerExtension
>['model']['commandTimer']['getById']>;

export const commandTimerExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      commandTimer: {
        serialize: {
          needs: {
            id: true,
            channelUserId: true,
            name: true,
            alias: true,
            cooldown: true,
            templateId: true,
            cron: true,
            enabled: true,
            lines: true,
          },
          compute(command) {
            return (): CommandTimer => {
              return {
                id: command.id,
                channelId: command.channelUserId,
                name: command.name,
                alias: command.alias,
                cooldown: command.cooldown,
                templateId: command.templateId,
                cron: command.cron,
                enabled: command.enabled,
                lines: command.lines,
              };
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      commandTimer: {
        async getById(id: number) {
          return Prisma.getExtensionContext(this).findFirst({
            where: { id },
            include: {
              user: true,
              template: true,
            },
          });
        },
        async getByChannelId(
          channelId: string,
          pagination: LimitOffsetPaginationState = null,
          idListFilter: idListFilterState = null,
        ) {
          return Prisma.getExtensionContext(this).findMany({
            where: {
              channelUserId: channelId,
              ...idListFilter,
            },
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
        async createFromApi(channelId: string, commandTimer: PostCommandTimerReqBody) {
          const result = await Prisma.getExtensionContext(this).create({
            data: {
              channelUserId: channelId,
              name: commandTimer.name,
              alias: commandTimer.alias,
              cooldown: commandTimer.cooldown,
              templateId: commandTimer.templateId,
              cron: commandTimer.cron,
              enabled: commandTimer.enabled,
              lines: commandTimer.lines,
            },

            include: {
              user: true,
              template: true,
            },
          });

          await Bot.reloadChannelCommandTimers(result.channelUserId);

          return result;
        },
        async updateFromApi(commandTimer: PatchCommandTimerReqBody) {
          const result = await Prisma.getExtensionContext(this).update({
            where: { id: commandTimer.id },
            data: {
              name: commandTimer.name,
              alias: commandTimer.alias,
              cooldown: commandTimer.cooldown,
              templateId: commandTimer.templateId,
              cron: commandTimer.cron,
              enabled: commandTimer.enabled,
              lines: commandTimer.lines,
            },

            include: {
              user: true,
              template: true,
            },
          });

          await Bot.reloadChannelCommandTimers(result.channelUserId);

          return result;
        },
        async deleteFromApi(commandTimer: DeleteCommandTimerReqBody) {
          return Prisma.getExtensionContext(this).delete({
            where: { id: commandTimer.id },
          });
        },
      },
    },
  });
});
