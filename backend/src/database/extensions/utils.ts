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
    },
  });
});

type PrismaExtension = ReturnType<typeof Prisma['defineExtension']>;

export type ExtensionType<T extends PrismaExtension> = ReturnType<T> ['$extends']['extArgs'];

export type ExtensionReturnType<T extends () => (...args: never[]) => Promise<unknown>> = NonNullable<Awaited<ReturnType<ReturnType<T>>>>;
