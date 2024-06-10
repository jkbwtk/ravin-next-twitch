import { eq } from 'drizzle-orm';
import { db } from '#database/database';
import { User, usersTable } from '#shared/schema/schema';
import { trackQueryPerformance } from '#database/utils';


const UserControllerTarget = {
  async getById(id: string): Promise<User | null> {
    const query = db
      .query.usersTable.findFirst({
        where: eq(usersTable.id, id),
      });

    const result = await query;

    return result ?? null;
  },

  async getByLogin(login: string): Promise<User | null> {
    const query = db
      .query.usersTable.findFirst({
        where: eq(usersTable.login, login),
      });

    const result = await query;

    return result ?? null;
  },

  async getAllIds(): Promise<string[]> {
    const query = db
      .query.usersTable.findMany({
        columns: {
          id: true,
        },
      });

    const result = await query;

    return result.map((user) => user.id);
  },
} as const;

export const UserController = trackQueryPerformance('UserController', UserControllerTarget);
