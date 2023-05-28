import { SystemNotification } from './systemNotifications';


export type ServerToClientEvents = {
  NEW_SYSTEM_NOTIFICATION: (notification: SystemNotification) => void;
};

export type ClientToServerEvents = {
  TEST_NOTIFICATION: (test: string) => void;
};

