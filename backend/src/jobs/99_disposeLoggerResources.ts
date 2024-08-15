import { Job } from '#jobs/job';
import { logger, loggerInstance } from '#lib/logger';


const disposeLoggerResources: Job = {
  name: 'Dispose Logger Resources',
  description: 'Disposes of any resources used by the logger',
  trigger: 'shutdown',

  run: async () => {
    logger.debug('Disposing of logger resources...', { label: ['Job', 'disposeLoggerResources'] });

    await loggerInstance.dispose();
  },
};

export default disposeLoggerResources;
