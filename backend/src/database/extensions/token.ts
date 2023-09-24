import { ExtensionReturnType, ExtensionType } from '#database/extensions/utils';
import { Prisma } from '@prisma/client';


export type TokenWithUserAndChannel = ExtensionReturnType<ExtensionType<
  typeof tokenExtension
>['model']['token']['getByUserId']>;

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
