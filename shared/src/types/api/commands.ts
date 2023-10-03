export enum UserLevel {
  Everyone = 0,
  Subscriber = 1,
  VIP = 2,
  Moderator = 3,
  Owner = 4,
}

export type CustomCommand = {
  id: number;
  channelId: string;
  command: string;
  response: string;
  userLevel: UserLevel;
  cooldown: number;
  enabled: boolean;
};

export type GetCustomCommandsResponse = {
  data: CustomCommand[];
};

export type PostCustomCommandRequest = Omit<CustomCommand, 'id' | 'channelId'>;

export type PatchCustomCommandRequest = Partial<PostCustomCommandRequest> & Pick<CustomCommand, 'id'>;

export type DeleteCustomCommandRequest = {
  id: CustomCommand['id'];
};

export type CustomCommandState = {
  lastUsed: number;
  lastUsedBy?: string;
  command: CustomCommand;
};

export type GetCustomCommandsStatusResponse = {
  data: CustomCommandState[];
};

export type CommandTimer = {
  id: number;
  channelId: string;
  name: string;
  alias: string;
  cooldown: number;
  response: string;
  cron: string;
  enabled: boolean;
  lines: number;
};

export type GetCommandTimersResponse = {
  data: CommandTimer[];
};

export type PostCommandTimerRequest = Omit<CommandTimer, 'id' | 'channelId'>;

export type PatchCommandTimerRequest = Partial<PostCommandTimerRequest> & Pick<CommandTimer, 'id'>;

export type DeleteCommandTimerRequest = {
  id: CommandTimer['id'];
};

export type CommandTimerState = {
  lastUsed: number;
  lastUsedBy?: string;
  lastRun: number | null;
  nextRun: number | null;
  status: 'running' | 'paused';
  pausedReason: string | null;
  timer: CommandTimer;
};

export type GetCommandTimersStatusResponse = {
  data: CommandTimerState[];
};
