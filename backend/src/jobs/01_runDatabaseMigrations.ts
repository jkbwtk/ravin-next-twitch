import { db } from '#database/database';
import { Job } from '#jobs/job';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { resolve } from 'path';


const runDatabaseMigrations: Job = {
  name: 'Run Database Migrations',
  description: 'Runs database migrations.',
  trigger: 'startup',

  run: async () => {
    await migrate(db, { migrationsFolder: resolve(__dirname, '../database/migrations') });
  },
};

export default runDatabaseMigrations;
