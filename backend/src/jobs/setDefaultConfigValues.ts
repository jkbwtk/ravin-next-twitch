import { Job } from '#jobs/job';
import { Config } from '#lib/Config';
import { logger } from '#lib/logger';


const defaultConfigValues: Record<string, string | number | object> = {
  defaultPaginationLimit: 10,
  paginationLimitOptions: [5, 10, 25, 50, 100],
};

const setDefaultConfigValues: Job = {
  name: 'Set Default Config Values',
  description: 'Sets (shadows) default values for config entries that do not exist',
  trigger: 'startup',

  run: async () => {
    logger.debug('Setting default config values', { label: ['Job', 'setDefaultConfigValues'] });

    for (const [key, value] of Object.entries(defaultConfigValues)) {
      try {
        const configValue = await Config.get(key);
        if (configValue !== undefined) continue;

        await Config.shadowSet(key, JSON.stringify(value));
      } catch (err) {
        logger.error('Failed to set default config value for %o', key, { error: err, label: ['Job', 'setDefaultConfigValues'] });
      }
    }
  },
};

export default setDefaultConfigValues;
