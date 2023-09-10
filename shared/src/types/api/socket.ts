import { CommandStatus, CustomCommand } from 'types/api/commands';
import { Action } from './dashboard';
import { SystemNotification } from './systemNotifications';
import { Message } from './logs';


export type ServerToClientEvents = {
  NEW_RECENT_ACTION: (action: Action) => void;

  NEW_CUSTOM_COMMAND: (command: CustomCommand) => void;
  UPD_CUSTOM_COMMAND: (command: CustomCommand) => void;
  DEL_CUSTOM_COMMAND: (commandId: number) => void;

  COMMAND_EXECUTED: (status: CommandStatus) => void;

  NEW_SYSTEM_NOTIFICATION: (notification: SystemNotification) => void;
  RAD_SYSTEM_NOTIFICATION: (notificationIds: number[]) => void;

  NEW_MESSAGE: (message: Message) => void;
};

export type ClientToServerEvents = {
  TEST_NOTIFICATION: (test: string) => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type SocketRoom = 'admin' | (string & {});
