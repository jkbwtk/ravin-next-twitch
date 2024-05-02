import { Prisma } from '@prisma/client';
import { DeletePhraseFilterReqBody, PatchPhraseFilterReqBody, PhraseFilter, PostPhraseFilterReqBody } from '#types/api/filters';
import { LimitOffsetPaginationState } from '#server/middlewares/pagination';


export const phraseFilterExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      phraseFilter: {
        serialize: {
          needs: {
            id: true,
            phrase: true,
            caseSensitive: true,
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
            where: { chanelUserId: channelId },

            ...pagination,
          });
        },
        async countByChannelId(channelId: string) {
          return Prisma.getExtensionContext(this).count({
            where: { chanelUserId: channelId },
          });
        },

        async createFromApi(channelId: string, phraseFiler: PostPhraseFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).create({
            data: {
              ...phraseFiler,
              chanelUserId: channelId,
            },
          });

          return result;
        },
        async updateFromApi(channelId: string, phraseFiler: PatchPhraseFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).update({
            where: { id: phraseFiler.id, chanelUserId: channelId },
            data: {
              ...phraseFiler,
            },
          });

          return result;
        },
        async deleteFromApi(channelId: string, phraseFiler: DeletePhraseFilterReqBody) {
          const result = await Prisma.getExtensionContext(this).delete({
            where: { id: phraseFiler.id, chanelUserId: channelId },
          });

          return result;
        },
      },
    },
  });
});
