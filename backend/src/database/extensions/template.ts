import { Bot } from '#bot/Bot';
import { StatesObject } from '#bot/TemplateRunner';
import { ExtensionReturnType, ExtensionType } from '#database/extensions/utils';
import { logger } from '#lib/logger';
import { DeleteTemplateReqBody, PatchTemplateReqBody, PostTemplateReqBody } from '#shared/types/api/templates';
import { Prisma } from '@prisma/client';


declare global {
  namespace PrismaJson {
    type TemplateStatesPrisma = StatesObject;
  }
}

export type Template = ExtensionReturnType<ExtensionType<
  typeof templateExtension
>['model']['template']['getById']>;

export const templateExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      template: {
        serialize: {
          needs: {
            id: true,
            name: true,
            template: true,
            userId: true,
          },
          compute(template) {
            return () => {
              return {
                id: template.id,
                name: template.name,
                template: template.template,
                userId: template.userId,
              };
            };
          },
        },
      },
    },
  }).$extends({
    model: {
      template: {
        async getById(id: number) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findFirst({
            where: { id },
          });

          logger.time('Getting template by id', t1);

          return result;
        },
        async getByChannelId(channelId: string) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).findMany({
            where: { userId: channelId },
          });

          logger.time('Getting template by channel id', t1);

          return result;
        },
        async saveStates(id: number, states: StatesObject) {
          const t1 = performance.now();

          await Prisma.getExtensionContext(this).update({
            where: { id },
            data: {
              states,
            },
          });

          logger.time('Saving states', t1);
        },
        async createFromApi(channelId: string, command: PostTemplateReqBody) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).create({
            data: {
              name: command.name,
              template: command.template,
              userId: channelId,
            },
          });

          logger.time('Creating template from api', t1);

          await Bot.reloadChannelCommands(result.userId);

          return result;
        },
        async updateFromApi(template: PatchTemplateReqBody) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).update({
            where: { id: template.id },
            data: {
              name: template.name,
              template: template.template,
            },
          });

          logger.time('Updating template from api', t1);

          await Bot.reloadChannelCommands(result.userId);

          return result;
        },
        async deleteFromApi(template: DeleteTemplateReqBody) {
          const t1 = performance.now();

          const result = await Prisma.getExtensionContext(this).delete({
            where: { id: template.id },
          });

          logger.time('Deleting template from api', t1);

          return result;
        },
      },
    },
  });
});
