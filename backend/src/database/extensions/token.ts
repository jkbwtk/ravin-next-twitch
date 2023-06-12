import { Prisma } from '@prisma/client';
import { z } from 'zod';


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

export const tokenCreateInput = z.object({
  id: z.number().optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  userId: z.string(),
}) satisfies z.Schema<Prisma.TokenUncheckedCreateInput>;

export const tokenExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      token: {
        async create({ args, query }) {
          args.data = await tokenCreateInput.parseAsync(args.data);
          return query(args);
        },
        async update({ args, query }) {
          args.data = await tokenCreateInput.partial().parseAsync(args.data);
          return query(args);
        },
      },
    },
  }).$extends({
    model: {
      token: {
        async validate(config: Prisma.TokenUncheckedCreateInput) {
          return tokenCreateInput.safeParseAsync(config);
        },
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
