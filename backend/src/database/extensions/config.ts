import { Prisma } from '@prisma/client';
import { z } from 'zod';


export const configCreateInput = z.object({
  key: z.string().max(32),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  destroyedAt: z.date().optional().nullable(),
}) satisfies z.Schema<Prisma.ConfigUncheckedCreateInput>;

export const configExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    model: {
      config: {
        async validate(config: Prisma.ChannelActionUncheckedCreateInput) {
          return configCreateInput.safeParseAsync(config);
        },
      },
    },
    query: {
      config: {
        async create({ args, query }) {
          args.data = await configCreateInput.parseAsync(args.data);
          return query(args);
        },
      },
    },
  });
});
