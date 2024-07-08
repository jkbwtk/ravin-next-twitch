import { TemplateTester } from '#bot/templates/TemplateTester';
import { TemplateController } from '#database/controllers/TemplateController';
import { Job } from '#jobs/job';
import { logger } from '#lib/logger';


const updateTemplateEnvironments: Job = {
  name: 'Update Supported Environments',
  description: 'Updates the supported environments for templates',
  trigger: 'startup',

  run: async () => {
    logger.debug('Fetching templates from database', { label: ['Job', 'updateTemplateEnvironments'] });
    const templates = await TemplateController.getAll();

    logger.debug('Fetched [%o] templates from database', templates.length, { label: ['Job', 'updateTemplateEnvironments'] });

    for (const template of templates) {
      try {
        const supportedEnvironments = (await TemplateTester.test(template.template)).getSupportedEnvironments();

        template.environments = supportedEnvironments;

        await TemplateController.update(template);
      } catch (err) {
        logger.warn('Failed to update environments for template [%s]', template.id, { error: err, label: ['Job', 'updateTemplateEnvironments'] });
      }
    }
  },
};

export default updateTemplateEnvironments;
