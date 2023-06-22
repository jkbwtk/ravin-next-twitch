import { Prisma } from '@prisma/client';


const tokenWithUserAndChannel = Prisma.validator<Prisma.TokenArgs>()({
  include: {
    user: {
      include: {
        channel: true,
      },
    },
  },
});

export type TokenWithUserAndChannel = Prisma.TokenGetPayload<typeof tokenWithUserAndChannel>;

export const tokenExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      token: {
        async getByUserId(userId: string) {
          return Prisma.getExtensionContext(this).findFirst({
            where: { userId },
            include: {
              user: {
                include: {
                  channel: true,
                },
              },
            },
          });
        },
        async getByUserIdOrFail(userId: string) {
          return Prisma.getExtensionContext(this).findFirstOrThrow({
            where: { userId },
            include: {
              user: {
                include: {
                  channel: true,
                },
              },
            },
          });
        },
      },
    },
  });
});
