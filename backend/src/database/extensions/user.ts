import { ChantingSettings } from '#shared/types/api/channel';
import { Prisma } from '@prisma/client';


const userWithChannel = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    channel: true,
  },
});

export type UserWithNullableChannel = Prisma.UserGetPayload<typeof userWithChannel> & {
  channel: {
    chantingSettings: ChantingSettings;
  }
};

export type UserWithChannel = UserWithNullableChannel & {
  channel: NonNullable<UserWithNullableChannel['channel']>;
};

export const userExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      user: {
        async createChannel(userId: string) {
          await client.channel.create({
            data: {
              userId,
            },
          });
        },
        async getById(id: string): Promise<UserWithChannel | null> {
          const user = await Prisma.getExtensionContext(this).findFirst({
            where: {
              id,
            },
            include: {
              channel: true,
            },
          });

          if (user === null) return null;
          if (user.channel === null) {
            await Prisma.getExtensionContext(this).createChannel(user.id);
            return Prisma.getExtensionContext(this).getById(id);
          }

          return user as UserWithChannel;
        },
        async getByIdOrFail(id: string): Promise<UserWithChannel> {
          const user = await Prisma.getExtensionContext(this).findFirst({
            where: {
              id,
            },
            include: {
              channel: true,
            },
          });

          if (user === null) throw new Error(`User with id ${id} not found`);
          if (user.channel === null) {
            await Prisma.getExtensionContext(this).createChannel(user.id);
            return Prisma.getExtensionContext(this).getByIdOrFail(id);
          }

          return user as UserWithChannel;
        },
        async getByLogin(login: string): Promise<UserWithChannel | null> {
          const user = await Prisma.getExtensionContext(this).findFirst({
            where: {
              login,
            },
            include: {
              channel: true,
            },
          });

          if (user === null) return null;
          if (user.channel === null) {
            await Prisma.getExtensionContext(this).createChannel(user.id);
            return Prisma.getExtensionContext(this).getByLogin(login);
          }

          return user as UserWithChannel;
        },
      },
    },
  });
});
