import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD } from '#database/utils';
import { systemNotificationsTable } from '#schema/schema';
import { arrayFrom } from '#shared/utils';
import { SystemNotification, SystemNotificationCreate } from '#types/database/tables';
import { and, eq, getTableColumns, inArray, isNull } from 'drizzle-orm';


const SystemNotificationControllerMethods = {
  ...createBasicCRUD(systemNotificationsTable),

  async getByUserId(userId: string): Promise<SystemNotification[]> {
    const query = db
      .query.systemNotificationsTable.findMany({
        where: eq(systemNotificationsTable.channelUserId, userId),
      });

    const result = await query;

    return result;
  },

  async broadcast(notification: Pick<SystemNotificationCreate, 'title' | 'content'>): Promise<SystemNotification[]> {
    return db.transaction(async (tx) => {
      const users = await tx.query.usersTable.findMany();

      const notifications: SystemNotificationCreate[] = users.map((user) => ({
        channelUserId: user.id,
        ...notification,
      }));

      const query = tx
        .insert(systemNotificationsTable)
        .values(notifications)
        .returning(getTableColumns(systemNotificationsTable));

      const result = await query;

      return result;
    });
  },

  async markAsReadById(id: number | number[]): Promise<SystemNotification[]> {
    const query = db
      .update(systemNotificationsTable)
      .set({
        readAt: new Date(),
      })
      .where(
        inArray(systemNotificationsTable.id, arrayFrom(id)),
      ).returning(getTableColumns(systemNotificationsTable));

    const result = await query;

    return result;
  },

  async markAsReadByUserId(userId: string): Promise<SystemNotification[]> {
    const query = db
      .update(systemNotificationsTable)
      .set({
        readAt: new Date(),
      })
      .where(
        and(
          eq(systemNotificationsTable.channelUserId, userId),
          isNull(systemNotificationsTable.readAt),
        ),
      )
      .returning(getTableColumns(systemNotificationsTable));

    const result = await query;

    return result;
  },

  async getReadByUserId(userId: string): Promise<SystemNotification[]> {
    const query = db
      .query.systemNotificationsTable.findMany({
        where: and(
          eq(systemNotificationsTable.channelUserId, userId),
          isNull(systemNotificationsTable.readAt),
        ),
      });

    const result = await query;

    return result;
  },
};


export const SystemNotificationController = convertToControllerProxy(
  'SystemNotificationController',
  SystemNotificationControllerMethods,
);
