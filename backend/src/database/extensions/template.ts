import { Bot } from '#bot/Bot';
import { StatesObject } from '#bot//templates/TemplateRunner';
import { ExtensionReturnType, ExtensionType } from '#database/extensions/utils';
import { DeleteTemplateReqBody, PatchTemplateReqBody, PostTemplateReqBody } from '#shared/types/api/templates';
import { Template as TemplateApi } from '#shared/types/api/templates';
import { Prisma } from '@prisma/client';
import { TemplateTester } from '#bot/templates/TemplateTester';


declare global {
  namespace PrismaJson {
    type TemplateStatesPrisma = StatesObject;

    type TemplateEnvironmentsPrisma = TemplateApi['environments'];
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
            environments: true,
          },
          compute(template) {
            return (): TemplateApi => {
              return {
                id: template.id,
                name: template.name,
                template: template.template,
                userId: template.userId,
                environments: template.environments,
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
          return Prisma.getExtensionContext(this).findFirst({
            where: { id },
          });
        },
        async getByChannelId(channelId: string) {
          return Prisma.getExtensionContext(this).findMany({
            where: { userId: channelId },
          });
        },
        async saveStates(id: number, states: StatesObject) {
          await Prisma.getExtensionContext(this).update({
            where: { id },
            data: {
              states,
            },
          });
        },
        async createFromApi(channelId: string, template: PostTemplateReqBody) {
          const result = await Prisma.getExtensionContext(this).create({
            data: {
              name: template.name,
              template: template.template,
              userId: channelId,
              environments: await TemplateTester.getSupportedEnvironments(template.template),
            },
          });

          await Bot.reloadChannelCommands(result.userId);

          return result;
        },
        async updateFromApi(template: PatchTemplateReqBody) {
          const result = await Prisma.getExtensionContext(this).update({
            where: { id: template.id },
            data: {
              name: template.name,
              template: template.template,
              environments: template.template ?
                await TemplateTester.getSupportedEnvironments(template.template) :
                undefined,
            },
          });

          await Bot.reloadChannelCommands(result.userId);

          return result;
        },
        async deleteFromApi(template: DeleteTemplateReqBody) {
          return Prisma.getExtensionContext(this).delete({
            where: { id: template.id },
          });
        },
      },
    },
  });
});
