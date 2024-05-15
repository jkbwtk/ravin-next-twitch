import { BehaviorProfile, Prisma } from '@prisma/client';
import { LimitOffsetPaginationState } from '#server/middlewares/pagination';
import { DeleteBehaviorProfileReqBody, PatchBehaviorProfileReqBody, PostBehaviorProfileReqBody } from '#types/api/behaviorProfiles';


export const behaviorProfileExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      behaviorProfile: {
        serialize: {
          needs: {
            id: true,
            name: true,
            enabled: true,
            description: true,
            activatorCategory: true,
            activatorTitle: true,
          },
          compute(profile) {
            return (): BehaviorProfile => {
              return {
                id: profile.id,
                name: profile.name,
                enabled: profile.enabled,
                description: profile.description,
                activatorCategory: profile.activatorCategory,
                activatorTitle: profile.activatorTitle,
                // @ts-expect-error - Prisma does not like relations in the result
                commands: profile.commands,
                // @ts-expect-error - Prisma does not like relations in the result
                phraseFilters: profile.phraseFilters,
                // @ts-expect-error - Prisma does not like relations in the result
                regexFilters: profile.regexFilters,
                // @ts-expect-error - Prisma does not like relations in the result
                commandTimers: profile.commandTimers,
              };
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      behaviorProfile: {
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

        async createFromApi(channelId: string, profile: PostBehaviorProfileReqBody) {
          const result = await Prisma.getExtensionContext(this).create({
            data: {
              ...profile,
              channelUserId: channelId,

              commands: {
                connect: profile.commands.map((id) => ({ id })),
              },
              phraseFilters: {
                connect: profile.phraseFilters.map((id) => ({ id })),
              },
              regexFilters: {
                connect: profile.regexFilters.map((id) => ({ id })),
              },
              commandTimers: {
                connect: profile.commandTimers.map((id) => ({ id })),
              },
            },
          });

          return result;
        },
        async updateFromApi(channelId: string, profile: PatchBehaviorProfileReqBody) {
          const result = await Prisma.getExtensionContext(this).update({
            where: { id: profile.id, channelUserId: channelId },
            data: {
              ...profile,

              commands: profile.commands ? {
                set: profile.commands.map((id) => ({ id })),
              } : undefined,
              phraseFilters: profile.phraseFilters ? {
                set: profile.phraseFilters.map((id) => ({ id })),
              } : undefined,
              regexFilters: profile.regexFilters ? {
                set: profile.regexFilters.map((id) => ({ id })),
              } : undefined,
              commandTimers: profile.commandTimers ? {
                set: profile.commandTimers.map((id) => ({ id })),
              } : undefined,
            },
          });

          return result;
        },
        async deleteFromApi(channelId: string, phraseFiler: DeleteBehaviorProfileReqBody) {
          const result = await Prisma.getExtensionContext(this).delete({
            where: { id: phraseFiler.id, channelUserId: channelId },
          });

          return result;
        },
      },
    },
  });
});
