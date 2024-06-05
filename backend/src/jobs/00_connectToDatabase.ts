import { postgresClient } from '#database/database';
import { Job } from '#jobs/job';


const connectToDatabase: Job = {
  name: 'Connect to Database',
  description: 'Awaits database connection.',
  trigger: 'startup',

  run: async () => {
    await postgresClient.connect();
  },
};

export default connectToDatabase;
