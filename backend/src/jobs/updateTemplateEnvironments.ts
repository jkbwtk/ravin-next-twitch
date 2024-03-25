import { TemplateTester } from '#bot/templates/TemplateTester';
import { prisma } from '#database/database';
import { Job } from '#jobs/job';
import { logger } from '#lib/logger';


const updateTemplateEnvironments: Job = {
  name: 'Update Supported Environments',
  description: 'Updates the supported environments for templates',
  trigger: 'startup',

  run: async () => {
    logger.debug('Fetching templates from database', { label: ['Job', 'updateTemplateEnvironments'] });
    const templates = await prisma.template.findMany();

    logger.debug('Fetched [%o] templates from database', templates.length, { label: ['Job', 'updateTemplateEnvironments'] });

    for (const template of templates) {
      try {
        const supportedEnvironments = await TemplateTester.getSupportedEnvironments(template.template);
        await prisma.template.update({
          data: {
            environments: supportedEnvironments,
          },
          where: {
            id: template.id,
          },
        });
      } catch (err) {
        logger.warn('Failed to update environments for template [%s]', template.id, { error: err, label: ['Job', 'updateTemplateEnvironments'] });
      }
    }
  },
};

export default updateTemplateEnvironments;
