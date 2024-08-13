import { CommandTimerApi, CommandTimerState, CustomCommandApi, CustomCommandState } from 'types/api/commands';
import { ChannelActionApi } from './dashboard';
import { SystemNotificationApi } from './systemNotifications';
import { MessageApi } from './message';
import { ScheduledJob } from 'types/api/admin';
import { TemplateApi } from 'types/api/templates';
import { PhraseFilterApi, RegexFilterApi } from 'types/api/filters';
import { BotActionApi } from 'types/api/botActions';
import { BehaviorProfileApi } from 'types/api/behaviorProfiles';
import { ChannelThreadInformation, ChannelThreadStreamStatus } from 'types/bot/channelThread';


export type ServerToClientEvents = {
  NEW_CHANNEL_ACTION: (action: ChannelActionApi) => void;
  UPD_CHANNEL_ACTION: (action: ChannelActionApi) => void;
  DEL_CHANNEL_ACTION: (actionId: number) => void;

  NEW_CUSTOM_COMMAND: (command: CustomCommandApi) => void;
  UPD_CUSTOM_COMMAND: (command: CustomCommandApi) => void;
  DEL_CUSTOM_COMMAND: (commandId: number) => void;

  COMMAND_EXECUTED: (status: CustomCommandState) => void;

  NEW_SYSTEM_NOTIFICATION: (notification: SystemNotificationApi) => void;
  RAD_SYSTEM_NOTIFICATION: (notificationIds: number[]) => void;

  NEW_MESSAGE: (message: MessageApi) => void;

  NEW_CRON_JOB: (job: ScheduledJob) => void;
  UPD_CRON_JOB: (job: ScheduledJob) => void;
  DEL_CRON_JOB: (creationTimestamp: number) => void;

  NEW_COMMAND_TIMER: (command: CommandTimerApi) => void;
  UPD_COMMAND_TIMER: (command: CommandTimerApi) => void;
  DEL_COMMAND_TIMER: (commandId: number) => void;

  COMMAND_TIMER_EXECUTED: (status: CommandTimerState) => void;

  NEW_TEMPLATE: (template: TemplateApi) => void;
  UPD_TEMPLATE: (template: TemplateApi) => void;
  DEL_TEMPLATE: (templateId: number) => void;

  NEW_PHRASE_FILTER: (filter: PhraseFilterApi) => void;
  UPD_PHRASE_FILTER: (filter: PhraseFilterApi) => void;
  DEL_PHRASE_FILTER: (filterId: number) => void;

  NEW_REGEX_FILTER: (filter: RegexFilterApi) => void;
  UPD_REGEX_FILTER: (filter: RegexFilterApi) => void;
  DEL_REGEX_FILTER: (filterId: number) => void;

  UPD_SESSION: () => void;

  NEW_BOT_ACTION: (action: BotActionApi) => void;

  NEW_BEHAVIOR_PROFILE: (profile: BehaviorProfileApi) => void;
  UPD_BEHAVIOR_PROFILE: (profile: BehaviorProfileApi) => void;
  DEL_BEHAVIOR_PROFILE: (profileId: number) => void;

  UPD_BEHAVIOR_PROFILE_ACTIVE_PROFILES: (profiles: BehaviorProfileApi[]) => void;

  UPD_CHANNEL_INFO: (info: ChannelThreadInformation | null) => void;
  UPD_CHANNEL_STREAM_STATUS: (status: ChannelThreadStreamStatus | null) => void;
};

export type ClientToServerEvents = {
  TEST_NOTIFICATION: (test: string) => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type SocketRoom = 'admin' | (string & {});
