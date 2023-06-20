import { Prisma } from '@prisma/client';
import { z } from 'zod';


export const ConfigCreateInputSchema = z.object({
  key: z.string().min(1).max(32),
  value: z.string(),
}) satisfies z.Schema<Partial<Prisma.ConfigUncheckedCreateInput>>;

const ConfigCreateInputSchemaPassthrough = ConfigCreateInputSchema.passthrough();

export const configExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      config: {
        async create({ args, query }) {
          args.data = await ConfigCreateInputSchemaPassthrough.parseAsync(args.data);
          return query(args);
        },
        async update({ args, query }) {
          args.data = await ConfigCreateInputSchemaPassthrough.partial().parseAsync(args.data);
          return query(args);
        },
        async createMany({ args, query }) {
          args.data = await z.array(ConfigCreateInputSchemaPassthrough).parseAsync(args.data);
          return query(args);
        },
        async updateMany({ args, query }) {
          args.data = await z.array(ConfigCreateInputSchemaPassthrough.partial()).parseAsync(args.data);
          return query(args);
        },
        async upsert({ args, query }) {
          args.create = await ConfigCreateInputSchemaPassthrough.parseAsync(args.create);
          args.update = await ConfigCreateInputSchemaPassthrough.partial().parseAsync(args.update);
          return query(args);
        },
      },
    },
  });
});
