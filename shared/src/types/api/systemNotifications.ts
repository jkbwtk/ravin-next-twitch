export interface SystemNotification {
  id: number;
  userId: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface GetSystemNotificationsResponse {
  data: SystemNotification[];
}

export interface PostSystemNotificationReadRequest {
  id: number | number[];
}

export interface GetSystemNotificationsReadResponse {
  data: SystemNotification[];
}

export interface PostSystemNotificationBroadcastRequest {
  title: string;
  content: string;
}
