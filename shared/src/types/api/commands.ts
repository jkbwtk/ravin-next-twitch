import { z } from 'zod';


export enum UserLevel {
  Everyone = 0,
  Subscriber = 1,
  VIP = 2,
  Moderator = 3,
  Owner = 4,
}

export const CustomCommand = z.object({
  id: z.number().int().positive(),
  channelId: z.string().min(1),
  command: z.string().min(1).max(64),
  templateId: z.number().int().positive(),
  userLevel: z.nativeEnum(UserLevel),
  cooldown: z.number().int().min(0).max(86400).multipleOf(5),
  enabled: z.boolean(),
});

export type CustomCommand = z.infer<typeof CustomCommand>;


export const GetCustomCommandsResponse = z.object({
  data: z.array(CustomCommand),
});

export type GetCustomCommandsResponse = z.infer<typeof GetCustomCommandsResponse>;


export const PostCustomCommandReqBody = CustomCommand.omit({ id: true, channelId: true });

export type PostCustomCommandReqBody = z.infer<typeof PostCustomCommandReqBody>;


export const PatchCustomCommandReqBody = CustomCommand.pick({ id: true }).merge(PostCustomCommandReqBody.partial());

export type PatchCustomCommandReqBody = z.infer<typeof PatchCustomCommandReqBody>;


export const DeleteCustomCommandReqBody = CustomCommand.pick({ id: true });

export type DeleteCustomCommandReqBody = z.infer<typeof DeleteCustomCommandReqBody>;


export const CustomCommandState = z.object({
  lastUsed: z.number().int().positive(),
  lastUsedBy: z.string().optional(),
  command: CustomCommand,
});

export type CustomCommandState = z.infer<typeof CustomCommandState>;


export const GetCustomCommandsStatusResponse = z.object({
  data: z.array(CustomCommandState),
});

export type GetCustomCommandsStatusResponse = z.infer<typeof GetCustomCommandsStatusResponse>;


export const CommandTimer = z.object({
  id: z.number().int().positive(),
  channelId: z.string().min(1),
  name: z.string().min(1).max(64),
  alias: z.string().min(1).max(64),
  cooldown: z.number().int().min(0).max(86400).multipleOf(5),
  response: z.string().min(1).max(512),
  cron: z.string().min(1).max(64),
  enabled: z.boolean(),
  lines: z.number().int().min(0).max(1024),
});

export type CommandTimer = z.infer<typeof CommandTimer>;


export const GetCommandTimersResponse = z.object({
  data: z.array(CommandTimer),
});

export type GetCommandTimersResponse = z.infer<typeof GetCommandTimersResponse>;


export const PostCommandTimerReqBody = CommandTimer.omit({ id: true, channelId: true });

export type PostCommandTimerReqBody = z.infer<typeof PostCommandTimerReqBody>;


export const PatchCommandTimerReqBody = CommandTimer.pick({ id: true }).merge(PostCommandTimerReqBody.partial());

export type PatchCommandTimerReqBody = z.infer<typeof PatchCommandTimerReqBody>;


export const DeleteCommandTimerReqBody = CommandTimer.pick({ id: true });

export type DeleteCommandTimerReqBody = z.infer<typeof DeleteCommandTimerReqBody>;


export const CommandTimerState = z.object({
  lastUsed: z.number().int().positive(),
  lastUsedBy: z.string().optional(),
  lastRun: z.number().int().positive().nullable(),
  nextRun: z.number().int().positive().nullable(),
  status: z.enum(['running', 'paused']),
  pausedReason: z.string().nullable(),
  timer: CommandTimer,
});

export type CommandTimerState = z.infer<typeof CommandTimerState>;


export const GetCommandTimersStatusResponse = z.object({
  data: z.array(CommandTimerState),
});

export type GetCommandTimersStatusResponse = z.infer<typeof GetCommandTimersStatusResponse>;
