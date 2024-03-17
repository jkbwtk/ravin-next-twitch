import { logger } from '#lib/logger';
import { Prisma } from '@prisma/client';

export const utilsExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        update({ args, query }) {
          args.data.updatedAt = new Date();
          return query(args);
        },
        updateMany({ args, query }) {
          args.data.updatedAt = new Date();
          return query(args);
        },
        upsert({ args, query }) {
          args.update.updatedAt = new Date();
          return query(args);
        },
      },

      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);

        logger.queryTime({ model, operation, args }, start);
        return result;
      },
    },
  });
});

type PrismaExtension = ReturnType<typeof Prisma['defineExtension']>;

export type ExtensionType<T extends PrismaExtension> = ReturnType<T> ['$extends']['extArgs'];

export type ExtensionReturnType<T extends () => (...args: never[]) => Promise<unknown>> = NonNullable<Awaited<ReturnType<ReturnType<T>>>>;
