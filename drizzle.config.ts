import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';


export default defineConfig({
  dialect: 'postgresql',
  out: './backend/src/database/migrations',
  schema: './shared/src/schema/schema.ts',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
