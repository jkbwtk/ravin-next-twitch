import { Prisma } from '@prisma/client';
import { DeletePhraseFilterReqBody, PatchPhraseFilterReqBody, PhraseFilter, PostPhraseFilterReqBody } from '#types/api/filters';
import { LimitOffsetPaginationState } from '#server/middlewares/pagination';
import { Bot } from '#bot/Bot';


export const phraseFilterExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      phraseFilter: {
        serialize: {
          needs: {
            id: true,
            phrase: true,
            caseSensitive: true,
            ignoreWhitespace: true,
            similarity: true,
            action: true,
            actionDuration: true,
            reason: true,
            enabled: true,
          },
          compute(phraseFilter) {
            return (): PhraseFilter => {
              return {
                id: phraseFilter.id,
                phrase: phraseFilter.phrase,
                caseSensitive: phraseFilter.caseSensitive,
                ignoreWhitespace: phraseFilter.ignoreWhitespace,
                similarity: phraseFilter.similarity,
                action: phraseFilter.action,
                actionDuration: phraseFilter.actionDuration,
                reason: phraseFilter.reason,
                enabled: phraseFilter.enabled,
              };
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      phraseFilter: {
        async getById(id: number) {
          return Prisma.getExtensionContext(this).findFirst({
            where: { id },
          });
        },
        async getByChannelId(channelId: string, pagination: LimitOffsetPaginationState = null) {
          return Prisma.getExtensionContext(this).findMany({
            where: { channelUserId: channelId },

            ...pagination,
          });
        },
        async countByChannelId(channelId: string) {
          return Prisma.getExtensionContext(this).count({
            where: { channelUserId: channelId },
          });
        },

        async createFromApi(channelId: string, phraseFiler: PostPhraseFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).create({
            data: {
              ...phraseFiler,
              channelUserId: channelId,
            },
          });

          await Bot.updateChannelPhraseFilter(channelId, result);

          return result;
        },
        async updateFromApi(channelId: string, phraseFiler: PatchPhraseFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).update({
            where: { id: phraseFiler.id, channelUserId: channelId },
            data: {
              ...phraseFiler,
            },
          });

          await Bot.updateChannelPhraseFilter(channelId, result);

          return result;
        },
        async deleteFromApi(channelId: string, phraseFiler: DeletePhraseFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).delete({
            where: { id: phraseFiler.id, channelUserId: channelId },
          });

          await Bot.deleteChannelPhraseFilter(channelId, result.id);

          return result;
        },
      },
    },
  });
});
