import { Prisma } from '@prisma/client';


export const commandTimerExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      commandTimer: {
        async getByUserId(userId: string) {
          return Prisma.getExtensionContext(this).findMany({
            where: { userId },
          });
        },
      },
    },
  });
});
