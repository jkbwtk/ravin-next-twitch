import { eq, getTableColumns } from 'drizzle-orm';
import { db } from '#database/database';
import { Channel, channelsTable, User, usersTable } from '#shared/schema/schema';
import { trackQueryPerformance } from '#database/utils';


const UserControllerTarget = {
  async createChannel(userId: string): Promise<Channel | null> {
    const query = db
      .insert(channelsTable)
      .values({ userId })
      .returning(getTableColumns(channelsTable))
      .onConflictDoNothing();

    const result = await query;

    return result.at(0) ?? null;
  },

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
} as const;

export const UserController = trackQueryPerformance('UserController', UserControllerTarget);
