import { Bot } from '#bot/Bot';
import { ChantingSettings } from '#shared/types/api/channel';
import { Prisma } from '@prisma/client';


declare global {
  namespace PrismaJson {
    type ChantingSettingsPrisma = ChantingSettings;
  }
}

const chanelWithUser = Prisma.validator<Prisma.ChannelArgs>()({
  include: {
    user: true,
  },
});

export type ChannelWithUser = Prisma.ChannelGetPayload<typeof chanelWithUser> & {
  chantingSettings: ChantingSettings;
};

export type ChannelUncheckedCreateInput = Prisma.ChannelUncheckedCreateInput & {
  chantingSettings?: ChantingSettings;
};

export const channelExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      channel: {
        async getByUserId(userId: string): Promise<ChannelWithUser | null> {
          return Prisma.getExtensionContext(this).findFirst({
            where: {
              userId,
            },
            include: {
              user: true,
            },
          }) as Promise<ChannelWithUser | null>;
        },
        async getByUserIdOrFail(userId: string): Promise<ChannelWithUser> {
          const channel = await Prisma.getExtensionContext(this).getByUserId(userId);
          if (channel === null) throw new Error(`Channel with userId ${userId} not found`);
          return channel;
        },
        async updateChantingFromApi(userId: string, settings: ChantingSettings): Promise<ChannelWithUser> {
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

          return updated as ChannelWithUser;
        },
      },
    },
  });
});
