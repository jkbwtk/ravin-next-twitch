import { serializer } from '#lib/serializer';
import { SystemNotificationApi } from '#types/api/systemNotifications';
import { SystemNotification } from '#types/database/tables';


export const SystemNotificationSerializer = serializer<SystemNotification, SystemNotificationApi>((notification) => ({
  id: notification.id,
  channelUserId: notification.channelUserId,
  title: notification.title,
  content: notification.content,
  read: notification.readAt !== null,
  createdAt: notification.createdAt,
}));
