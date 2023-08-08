import { Bot } from '#bot/Bot';
import { logger } from '#lib/logger';
import { CustomCommand, PatchCustomCommandRequest, PostCustomCommandRequest, UserLevel } from '#shared/types/api/commands';
import { Prisma } from '@prisma/client';
import { z } from 'zod';


declare global {
  namespace PrismaJson {
    type UserLevelPrisma = UserLevel;
  }
}

export const PostCustomCommandSchema = z.object({
  command: z.string().min(1).max(64),
  response: z.string().min(1).max(512),
  userLevel: z.nativeEnum(UserLevel),
  cooldown: z.number().int().min(0).max(86400).multipleOf(5),
  enabled: z.boolean(),
}) satisfies z.Schema<PostCustomCommandRequest>;

export const PatchCustomCommandSchema = z.object({
  id: z.number().min(1),
}).and(PostCustomCommandSchema.partial()) satisfies z.Schema<PatchCustomCommandRequest>;

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

          logger.time('Getting command by id', t1);

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

          logger.time('Getting commands by channel id', t1);

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

          logger.time('Incrementing command usage', t1);
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

          logger.time('Getting top command', t1);

          return result;
        },
        async createFromApi(channelId: string, request: PostCustomCommandRequest) {
          const validated = await PostCustomCommandSchema.safeParseAsync(request);

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

          logger.time('Creating command from api', t1);

          await Bot.reloadChannelCommands(result.channelUserId);

          return result;
        },
        async updateFromApi(request: PatchCustomCommandRequest) {
          const validated = await PatchCustomCommandSchema.safeParseAsync(request);

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

          logger.time('Updating command from api', t1);

          await Bot.reloadChannelCommands(result.channelUserId);

          return result;
        },
        async deleteFromApi(id: number) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).delete({
            where: { id },
          });

          logger.time('Deleting command from api', t1);

          return result;
        },
      },
    },
  });
});

export type CommandWithUser = NonNullable<Awaited<ReturnType<ReturnType<typeof commandExtension>['command']['getById']>>>;
