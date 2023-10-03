import { CommandTimer, CommandTimerState, CustomCommand, CustomCommandState } from 'types/api/commands';
import { Action } from './dashboard';
import { SystemNotification } from './systemNotifications';
import { Message } from './logs';
import { ScheduledJob } from 'types/api/admin';


export type ServerToClientEvents = {
  NEW_RECENT_ACTION: (action: Action) => void;

  NEW_CUSTOM_COMMAND: (command: CustomCommand) => void;
  UPD_CUSTOM_COMMAND: (command: CustomCommand) => void;
  DEL_CUSTOM_COMMAND: (commandId: number) => void;

  COMMAND_EXECUTED: (status: CustomCommandState) => void;

  NEW_SYSTEM_NOTIFICATION: (notification: SystemNotification) => void;
  RAD_SYSTEM_NOTIFICATION: (notificationIds: number[]) => void;

  NEW_MESSAGE: (message: Message) => void;

  NEW_CRON_JOB: (job: ScheduledJob) => void;
  UPD_CRON_JOB: (job: ScheduledJob) => void;
  DEL_CRON_JOB: (creationTimestamp: number) => void;

  NEW_COMMAND_TIMER: (command: CommandTimer) => void;
  UPD_COMMAND_TIMER: (command: CommandTimer) => void;
  DEL_COMMAND_TIMER: (commandId: number) => void;

  COMMAND_TIMER_EXECUTED: (status: CommandTimerState) => void;
};

export type ClientToServerEvents = {
  TEST_NOTIFICATION: (test: string) => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type SocketRoom = 'admin' | (string & {});
