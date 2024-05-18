import { Prisma } from '@prisma/client';
import { LimitOffsetPaginationState } from '#server/middlewares/pagination';
import { BehaviorProfile, DeleteBehaviorProfileReqBody, PatchBehaviorProfileReqBody, PostBehaviorProfileReqBody } from '#types/api/behaviorProfiles';
import { SocketServer } from '#server/SocketServer';


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
                commands: profile.commands.map((command) => command.serialize()),
                // @ts-expect-error - Prisma does not like relations in the result
                phraseFilters: profile.phraseFilters.map((filter) => filter.serialize()),
                // @ts-expect-error - Prisma does not like relations in the result
                regexFilters: profile.regexFilters.map((filter) => filter.serialize()),
                // @ts-expect-error - Prisma does not like relations in the result
                commandTimers: profile.commandTimers.map((timer) => timer.serialize()),
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
            include: {
              commands: true,
              phraseFilters: true,
              regexFilters: true,
              commandTimers: true,
            },
          });
        },
        async getByChannelId(channelId: string, pagination: LimitOffsetPaginationState = null) {
          return Prisma.getExtensionContext(this).findMany({
            where: { channelUserId: channelId },
            include: {
              commands: true,
              phraseFilters: true,
              regexFilters: true,
              commandTimers: true,
            },

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
                connect: profile.commands.map((id) => ({ id, channelUserId: channelId })),
              },
              phraseFilters: {
                connect: profile.phraseFilters.map((id) => ({ id, channelUserId: channelId })),
              },
              regexFilters: {
                connect: profile.regexFilters.map((id) => ({ id, channelUserId: channelId })),
              },
              commandTimers: {
                connect: profile.commandTimers.map((id) => ({ id, channelUserId: channelId })),
              },
            },

            include: {
              commands: true,
              phraseFilters: true,
              regexFilters: true,
              commandTimers: true,
            },
          });

          SocketServer.emitToUser(channelId, 'NEW_BEHAVIOR_PROFILE', result.serialize());

          return result;
        },
        async updateFromApi(channelId: string, profile: PatchBehaviorProfileReqBody) {
          const result = await Prisma.getExtensionContext(this).update({
            where: { id: profile.id, channelUserId: channelId },
            data: {
              ...profile,

              commands: profile.commands ? {
                set: profile.commands.map((id) => ({ id, channelUserId: channelId })),
              } : undefined,
              phraseFilters: profile.phraseFilters ? {
                set: profile.phraseFilters.map((id) => ({ id, channelUserId: channelId })),
              } : undefined,
              regexFilters: profile.regexFilters ? {
                set: profile.regexFilters.map((id) => ({ id, channelUserId: channelId })),
              } : undefined,
              commandTimers: profile.commandTimers ? {
                set: profile.commandTimers.map((id) => ({ id, channelUserId: channelId })),
              } : undefined,
            },

            include: {
              commands: true,
              phraseFilters: true,
              regexFilters: true,
              commandTimers: true,
            },
          });

          SocketServer.emitToUser(channelId, 'UPD_BEHAVIOR_PROFILE', result.serialize());

          return result;
        },
        async deleteFromApi(channelId: string, profile: DeleteBehaviorProfileReqBody) {
          const result = await Prisma.getExtensionContext(this).delete({
            where: { id: profile.id, channelUserId: channelId },
          });

          SocketServer.emitToUser(channelId, 'DEL_BEHAVIOR_PROFILE', profile.id);

          return result;
        },
      },
    },
  });
});
