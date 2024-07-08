import { eq, getTableColumns } from 'drizzle-orm';
import { db } from '#database/database';
import { usersTable } from '#schema/schema';
import { convertToControllerProxy } from '#database/utils';
import { User, UserInsert } from '#types/database/tables';


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

  async upsert(user: UserInsert): Promise<User | null> {
    const query = db
      .insert(usersTable)
      .values(user)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: user,
      })
      .returning(getTableColumns(usersTable));

    const result = await query;

    return result.at(0) ?? null;
  },
} as const;

export const UserController = convertToControllerProxy('UserController', UserControllerTarget);
