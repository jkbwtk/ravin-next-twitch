import { CommandTimer, CommandTimerState, CustomCommand, CustomCommandState } from 'types/api/commands';
import { Action } from './dashboard';
import { SystemNotification } from './systemNotifications';
import { MessageApi } from './message';
import { ScheduledJob } from 'types/api/admin';
import { Template } from 'types/api/templates';
import { PhraseFilter, RegexFilter } from 'types/api/filters';
import { BotAction } from 'types/api/botActions';
import { BehaviorProfileApi } from 'types/api/behaviorProfiles';


export type ServerToClientEvents = {
  NEW_CHANNEL_ACTION: (action: Action) => void;
  UPD_CHANNEL_ACTION: (action: Action) => void;
  DEL_CHANNEL_ACTION: (actionId: number) => void;

  NEW_CUSTOM_COMMAND: (command: CustomCommand) => void;
  UPD_CUSTOM_COMMAND: (command: CustomCommand) => void;
  DEL_CUSTOM_COMMAND: (commandId: number) => void;

  COMMAND_EXECUTED: (status: CustomCommandState) => void;

  NEW_SYSTEM_NOTIFICATION: (notification: SystemNotification) => void;
  RAD_SYSTEM_NOTIFICATION: (notificationIds: number[]) => void;

  NEW_MESSAGE: (message: MessageApi) => void;

  NEW_CRON_JOB: (job: ScheduledJob) => void;
  UPD_CRON_JOB: (job: ScheduledJob) => void;
  DEL_CRON_JOB: (creationTimestamp: number) => void;

  NEW_COMMAND_TIMER: (command: CommandTimer) => void;
  UPD_COMMAND_TIMER: (command: CommandTimer) => void;
  DEL_COMMAND_TIMER: (commandId: number) => void;

  COMMAND_TIMER_EXECUTED: (status: CommandTimerState) => void;

  NEW_TEMPLATE: (template: Template) => void;
  UPD_TEMPLATE: (template: Template) => void;
  DEL_TEMPLATE: (templateId: number) => void;

  NEW_PHRASE_FILTER: (filter: PhraseFilter) => void;
  UPD_PHRASE_FILTER: (filter: PhraseFilter) => void;
  DEL_PHRASE_FILTER: (filterId: number) => void;

  NEW_REGEX_FILTER: (filter: RegexFilter) => void;
  UPD_REGEX_FILTER: (filter: RegexFilter) => void;
  DEL_REGEX_FILTER: (filterId: number) => void;

  UPD_SESSION: () => void;

  NEW_BOT_ACTION: (action: BotAction) => void;

  NEW_BEHAVIOR_PROFILE: (profile: BehaviorProfileApi) => void;
  UPD_BEHAVIOR_PROFILE: (profile: BehaviorProfileApi) => void;
  DEL_BEHAVIOR_PROFILE: (profileId: number) => void;

  UPD_BEHAVIOR_PROFILE_STATUS: () => void;
};

export type ClientToServerEvents = {
  TEST_NOTIFICATION: (test: string) => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type SocketRoom = 'admin' | (string & {});
