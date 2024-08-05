import { postgresOptions } from '#database/database';
import { Job } from '#jobs/job';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { resolve } from 'path';
import postgres from 'postgres';
import * as schema from '#schema/schema';
import * as relations from '#schema/relations';
import { databaseDebug } from '#shared/constants';
import { logger } from '#lib/logger';
import { drizzle } from 'drizzle-orm/postgres-js';


const runDatabaseMigrations: Job = {
  name: 'Run Database Migrations',
  description: 'Runs database migrations.',
  trigger: 'startup',

  run: async () => {
    const migrationClient = postgres({ ...postgresOptions, max: 1, debug: false });
    const migrationDb = drizzle(migrationClient, { schema: { ...schema, ...relations }, logger: databaseDebug ? logger : false });

    await migrate(migrationDb, { migrationsFolder: resolve(__dirname, '../database/migrations') });

    migrationClient.end();
  },
};

export default runDatabaseMigrations;
