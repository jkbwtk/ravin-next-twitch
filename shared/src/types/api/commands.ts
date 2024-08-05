import { createSelectSchema } from 'drizzle-zod';
import { PaginatedResponse } from '../pagination';
import { z } from 'zod';
import { commandsTable, commandTimersTable } from '../../schema/schema';


export enum UserLevel {
  Everyone = 0,
  Subscriber = 1,
  VIP = 2,
  Moderator = 3,
  Owner = 4,
}


export const UserLevels = z.nativeEnum(UserLevel);

export type UserLevels = z.infer<typeof UserLevels>;


export const UserLevelsArray = Object.values(UserLevel).filter((v) => !isNaN(Number(v))) as UserLevel[];


export const CustomCommandApi = createSelectSchema(commandsTable, {
  id: (schema) => schema.id.positive().int(),
  channelUserId: (schema) => schema.channelUserId.min(1),
  command: (schema) => schema.command.min(1).max(64),
  templateId: (schema) => schema.templateId.positive().int(),
  userLevel: () => UserLevels,
  cooldown: (schema) => schema.cooldown.int().min(0).max(86400).multipleOf(5),
}).pick({
  id: true,
  channelUserId: true,
  command: true,
  templateId: true,
  userLevel: true,
  cooldown: true,
  enabled: true,
});

export type CustomCommandApi = z.infer<typeof CustomCommandApi>;


export const GetCustomCommandsResponse = z.object({
  data: z.array(CustomCommandApi),
});

export type GetCustomCommandsResponse = z.infer<typeof GetCustomCommandsResponse>;


export const GetCustomCommandsPaginatedResponse = PaginatedResponse(GetCustomCommandsResponse);

export type GetCustomCommandsPaginatedResponse = z.infer<typeof GetCustomCommandsPaginatedResponse>;


export const PostCustomCommandReqBody = CustomCommandApi.omit({ id: true, channelUserId: true });

export type PostCustomCommandReqBody = z.infer<typeof PostCustomCommandReqBody>;


export const PatchCustomCommandReqBody = CustomCommandApi.pick({ id: true }).merge(PostCustomCommandReqBody.partial());

export type PatchCustomCommandReqBody = z.infer<typeof PatchCustomCommandReqBody>;


export const DeleteCustomCommandReqBody = CustomCommandApi.pick({ id: true });

export type DeleteCustomCommandReqBody = z.infer<typeof DeleteCustomCommandReqBody>;


export const CustomCommandState = z.object({
  lastUsed: z.number().int().nonnegative(),
  lastUsedBy: z.string().optional(),
  command: CustomCommandApi,
});

export type CustomCommandState = z.infer<typeof CustomCommandState>;


export const GetCustomCommandsStatusResponse = z.object({
  data: z.array(CustomCommandState),
});

export type GetCustomCommandsStatusResponse = z.infer<typeof GetCustomCommandsStatusResponse>;


export const CommandTimerApi = createSelectSchema(commandTimersTable, {
  id: (schema) => schema.id.positive().int(),
  channelUserId: (schema) => schema.channelUserId.min(1),
  name: (schema) => schema.name.min(1).max(64),
  alias: (schema) => schema.alias.min(1).max(64),
  cooldown: (schema) => schema.cooldown.int().min(0).max(86400).multipleOf(5),
  templateId: (schema) => schema.templateId.positive().int(),
  cron: (schema) => schema.cron.min(1).max(64),
  lines: (schema) => schema.lines.int().min(0).max(1024),
}).pick({
  id: true,
  channelUserId: true,
  name: true,
  alias: true,
  cooldown: true,
  templateId: true,
  cron: true,
  enabled: true,
  lines: true,
});

export type CommandTimerApi = z.infer<typeof CommandTimerApi>;

export const GetCommandTimersResponse = z.object({
  data: z.array(CommandTimerApi),
});

export type GetCommandTimersResponse = z.infer<typeof GetCommandTimersResponse>;


export const GetCommandTimersPaginatedResponse = PaginatedResponse(GetCommandTimersResponse);

export type GetCommandTimersPaginatedResponse = z.infer<typeof GetCommandTimersPaginatedResponse>;


export const PostCommandTimerReqBody = CommandTimerApi.omit({ id: true, channelUserId: true });

export type PostCommandTimerReqBody = z.infer<typeof PostCommandTimerReqBody>;


export const PatchCommandTimerReqBody = CommandTimerApi.pick({ id: true }).merge(PostCommandTimerReqBody.partial());

export type PatchCommandTimerReqBody = z.infer<typeof PatchCommandTimerReqBody>;


export const DeleteCommandTimerReqBody = CommandTimerApi.pick({ id: true });

export type DeleteCommandTimerReqBody = z.infer<typeof DeleteCommandTimerReqBody>;


export const CommandTimerState = z.object({
  lastUsed: z.number().int().positive(),
  lastUsedBy: z.string().optional(),
  lastRun: z.number().int().positive().nullable(),
  nextRun: z.number().int().positive().nullable(),
  status: z.enum(['running', 'paused']),
  pausedReason: z.string().nullable(),
  timer: CommandTimerApi,
});

export type CommandTimerState = z.infer<typeof CommandTimerState>;


export const GetCommandTimersStatusResponse = z.object({
  data: z.array(CommandTimerState),
});

export type GetCommandTimersStatusResponse = z.infer<typeof GetCommandTimersStatusResponse>;
