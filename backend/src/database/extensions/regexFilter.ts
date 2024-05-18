import { Prisma } from '@prisma/client';
import { DeleteRegexFilterReqBody, PatchRegexFilterReqBody, PostRegexFilterReqBody, RegexFilter } from '#types/api/filters';
import { LimitOffsetPaginationState } from '#server/middlewares/pagination';
import { Bot } from '#bot/Bot';
import { idListFilterState } from '#server/middlewares/idListFilter';


export const regexFilterExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      regexFilter: {
        serialize: {
          needs: {
            id: true,
            regex: true,
            action: true,
            actionDuration: true,
            reason: true,
            enabled: true,
          },
          compute(regexFilter) {
            return (): RegexFilter => {
              return {
                id: regexFilter.id,
                regex: regexFilter.regex,
                action: regexFilter.action,
                actionDuration: regexFilter.actionDuration,
                reason: regexFilter.reason,
                enabled: regexFilter.enabled,
              };
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      regexFilter: {
        async getById(id: number) {
          return Prisma.getExtensionContext(this).findFirst({
            where: { id },
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

            ...pagination,
          });
        },
        async countByChannelId(channelId: string) {
          return Prisma.getExtensionContext(this).count({
            where: { channelUserId: channelId },
          });
        },

        async createFromApi(channelId: string, regexFilter: PostRegexFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).create({
            data: {
              ...regexFilter,
              channelUserId: channelId,
            },
          });

          await Bot.updateChannelRegexFilter(channelId, result);

          return result;
        },
        async updateFromApi(channelId: string, regexFilter: PatchRegexFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).update({
            where: { id: regexFilter.id, channelUserId: channelId },
            data: {
              ...regexFilter,
            },
          });

          await Bot.updateChannelRegexFilter(channelId, result);

          return result;
        },
        async deleteFromApi(channelId: string, regexFilter: DeleteRegexFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).delete({
            where: { id: regexFilter.id, channelUserId: channelId },
          });

          await Bot.deleteChannelRegexFilter(channelId, result.id);

          return result;
        },
      },
    },
  });
});
