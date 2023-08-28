export type ConfigRequest = {
  adminUsername: string;
  botLogin: string;
  botToken: string;
  twitchClientId: string;
  twitchClientSecret: string;
};

export type PatchConfigRequest = Partial<ConfigRequest>;

export type ScheduledJob = {
  name: string | null;
  cron: string | null;
  nextRun: number | null,
  lastRun: number | null,
  maxRuns: number | null,
  isRunning: boolean,
  isStopped: boolean,
  isBusy: boolean,
};

export type GetScheduledJobsResponse = {
  data: ScheduledJob[];
};
