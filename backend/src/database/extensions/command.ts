import { Bot } from '#bot/Bot';
import { display } from '#lib/display';
import { CustomCommand, PatchCustomCommandRequest, PostCustomCommandRequest, UserLevel } from '#shared/types/api/commands';
import { Prisma } from '@prisma/client';
import { z } from 'zod';


declare global {
  namespace PrismaJson {
    type UserLevelPrisma = UserLevel;
  }
}

export const commandCreateInput = z.object({
  id: z.number().min(1).optional(),
  channelUserId: z.string(),
  command: z.string().min(1).max(64),
  response: z.string().min(1).max(512),
  userLevel: z.nativeEnum(UserLevel),
  cooldown: z.number().int().min(0).max(86400).multipleOf(5),
  enabled: z.boolean(),
  usage: z.number().int().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  destroyedAt: z.date().optional(),
}) satisfies z.Schema<Prisma.CommandUncheckedCreateInput>;

export const postCustomCommand = z.object({
  command: z.string().min(1).max(64),
  response: z.string().min(1).max(512),
  userLevel: z.nativeEnum(UserLevel),
  cooldown: z.number().int().min(0).max(86400).multipleOf(5),
  enabled: z.boolean(),
}) satisfies z.Schema<PostCustomCommandRequest>;

export const patchCustomCommand = z.object({
  id: z.number().min(1),
}).and(postCustomCommand.partial()) satisfies z.Schema<PatchCustomCommandRequest>;

export const commandExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      command: {
        serialize: {
          needs: {
            id: true,
            channelUserId: true,
            command: true,
            response: true,
            userLevel: true,
            cooldown: true,
            enabled: true,
          },
          compute(command) {
            return (): CustomCommand => {
              return {
                id: command.id,
                channelId: command.channelUserId,
                command: command.command,
                response: command.response,
                userLevel: command.userLevel,
                cooldown: command.cooldown,
                enabled: command.enabled,
              };
            };
          },
        },
      },
    },
  }).$extends({
    query: {
      command: {
        async create({ args, query }) {
          args.data = await commandCreateInput.parseAsync(args.data);
          return query(args);
        },
      },
    },
  }).$extends({
    model: {
      command: {
        async getById(id: number) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findFirst({
            where: { id },
            include: {
              user: true,
            },
          });

          display.time('Getting command by id', t1);

          return result;
        },
        async getByChannelId(channelId: string) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findMany({
            where: { channelUserId: channelId },
            include: {
              user: true,
            },
          });

          display.time('Getting commands by channel id', t1);

          return result;
        },
        async incrementUsage(id: number) {
          const t1 = performance.now();

          await Prisma.getExtensionContext(this).update({
            where: { id },
            data: {
              usage: {
                increment: 1,
              },
            },
          });

          display.time('Incrementing command usage', t1);
        },
        async getTopCommand(channelId: string) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findFirst({
            where: { channelUserId: channelId },
            orderBy: {
              usage: 'desc',
            },
            include: {
              user: true,
            },
          });

          display.time('Getting top command', t1);

          return result;
        },
        async createFromApi(channelId: string, request: PostCustomCommandRequest) {
          const validated = await postCustomCommand.safeParseAsync(request);

          if (!validated.success) {
            throw new Error(validated.error.message);
          }

          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).create({
            data: {
              channelUserId: channelId,
              command: validated.data.command,
              response: validated.data.response,
              userLevel: validated.data.userLevel,
              cooldown: validated.data.cooldown,
              enabled: validated.data.enabled,
            },
            include: {
              user: true,
            },
          });

          display.time('Creating command from api', t1);

          await Bot.reloadChannelCommands(result.channelUserId);

          return result;
        },
        async updateFromApi(request: PatchCustomCommandRequest) {
          const validated = await patchCustomCommand.safeParseAsync(request);

          if (!validated.success) {
            throw new Error(validated.error.message);
          }

          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).update({
            where: { id: validated.data.id },
            data: {
              command: validated.data.command,
              response: validated.data.response,
              userLevel: validated.data.userLevel,
              cooldown: validated.data.cooldown,
              enabled: validated.data.enabled,
            },
            include: {
              user: true,
            },
          });

          display.time('Updating command from api', t1);

          await Bot.reloadChannelCommands(result.channelUserId);

          return result;
        },
        async deleteFromApi(id: number) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).delete({
            where: { id },
          });

          display.time('Deleting command from api', t1);

          return result;
        },
      },
    },
  });
});

export type CommandWithUser = NonNullable<Awaited<ReturnType<ReturnType<typeof commandExtension>['command']['getById']>>>;
