import { Action } from './dashboard';
import { SystemNotification } from './systemNotifications';


export type ServerToClientEvents = {
  NEW_SYSTEM_NOTIFICATION: (notification: SystemNotification) => void;
  NEW_RECENT_ACTION: (action: Action) => void;
};

export type ClientToServerEvents = {
  TEST_NOTIFICATION: (test: string) => void;
};
