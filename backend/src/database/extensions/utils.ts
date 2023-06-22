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
