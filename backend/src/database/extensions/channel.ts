import { Bot } from '#bot/Bot';
import { ExtensionReturnType, ExtensionType } from '#database/extensions/utils';
import { ChantingSettings } from '#shared/types/api/channel';
import { Prisma } from '@prisma/client';


declare global {
  namespace PrismaJson {
    type ChantingSettingsPrisma = ChantingSettings;
  }
}

export type ChannelWithUser = ExtensionReturnType<ExtensionType<
  typeof channelExtension
>['model']['channel']['getByUserId']>;

export const channelExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      channel: {
        async getByUserId(userId: string) {
          return Prisma.getExtensionContext(this).findFirst({
            where: {
              userId,
            },
            include: {
              user: true,
            },
          });
        },
        async getByUserIdOrFail(userId: string) {
          const channel = await Prisma.getExtensionContext(this).getByUserId(userId);
          if (channel === null) throw new Error(`Channel with userId ${userId} not found`);
          return channel;
        },
        async updateChantingFromApi(userId: string, settings: ChantingSettings) {
          const channel = await Prisma.getExtensionContext(this).getByUserIdOrFail(userId);

          const updated = await Prisma.getExtensionContext(this).update({
            where: {
              userId: channel.userId,
            },
            data: {
              chantingSettings: settings,
            },
            include: {
              user: true,
            },
          });

          await Bot.reloadChannelChannel(userId);

          return updated;
        },
      },
    },
  });
});
