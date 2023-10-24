import { StatesObject } from '#bot/TemplateRunner';
import { ExtensionReturnType, ExtensionType } from '#database/extensions/utils';
import { logger } from '#lib/logger';
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
      },
    },
  });
});
