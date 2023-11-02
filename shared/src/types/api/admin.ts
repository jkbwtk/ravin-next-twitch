import { z } from 'zod';


export const Config = z.object({
  adminUsername: z.string().min(1).max(64),
  botLogin: z.string().min(1).max(64),
  botToken: z.string().min(1).max(64),
  twitchClientId: z.string().min(1).max(64),
  twitchClientSecret: z.string().min(1).max(64),
});

export type Config = z.infer<typeof Config>;


export const PatchConfigReqBody = Config.partial();

export type PatchConfigReqBody = z.infer<typeof PatchConfigReqBody>;


export const ScheduledJob = z.object({
  name: z.string().min(1),
  originalName: z.string().min(1),
  cron: z.string().nullable(),
  nextRun: z.number().nullable(),
  lastRun: z.number().nullable(),
  maxRuns: z.number().nullable(),
  isRunning: z.boolean(),
  isStopped: z.boolean(),
  isBusy: z.boolean(),
  creationTimestamp: z.number(),
  pausedReason: z.string().nullable(),
  resumedReason: z.string().nullable(),
});

export type ScheduledJob = z.infer<typeof ScheduledJob>;


export const GetScheduledJobsResponse = z.object({
  data: z.array(ScheduledJob),
});

export type GetScheduledJobsResponse = z.infer<typeof GetScheduledJobsResponse>;
