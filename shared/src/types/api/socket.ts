import { CommandStatus, CustomCommand } from 'types/api/commands';
import { Action } from './dashboard';
import { SystemNotification } from './systemNotifications';


export type ServerToClientEvents = {
  NEW_SYSTEM_NOTIFICATION: (notification: SystemNotification) => void;
  NEW_RECENT_ACTION: (action: Action) => void;

  NEW_CUSTOM_COMMAND: (command: CustomCommand) => void;
  UPD_CUSTOM_COMMAND: (command: CustomCommand) => void;
  DEL_CUSTOM_COMMAND: (commandId: number) => void;

  COMMAND_EXECUTED: (status: CommandStatus) => void;
};

export type ClientToServerEvents = {
  TEST_NOTIFICATION: (test: string) => void;
};
