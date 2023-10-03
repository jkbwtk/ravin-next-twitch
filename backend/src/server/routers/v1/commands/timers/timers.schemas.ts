import { DeleteCommandTimerRequest, PatchCommandTimerRequest, PostCommandTimerRequest } from '#shared/types/api/commands';
import { z } from 'zod';


const CommandTimerSchemaBase = z.object({
  name: z.string().min(1).max(64),
  alias: z.string().min(1).max(64),
  cooldown: z.number().int().min(0).max(86400).multipleOf(5),
  response: z.string().min(1).max(512),
  cron: z.string().min(1).max(64),
  enabled: z.boolean(),
  lines: z.number().int().min(0).max(1024),
}) satisfies z.Schema<PostCommandTimerRequest>;

export type PostCommandTimerRequestSchema = {
  body: PostCommandTimerRequest;
};

export const PostCommandTimerSchema = z.object({
  body: CommandTimerSchemaBase,
}) satisfies z.Schema<PostCommandTimerRequestSchema>;

export type PatchCustomCommandRequestSchema = {
  body: PatchCommandTimerRequest;
};

export const PatchCommandTimerSchema = z.object({
  body: z.object({
    id: z.number().min(1),
  }).merge(CommandTimerSchemaBase.partial()),
}) satisfies z.Schema<PatchCustomCommandRequestSchema>;

export type DeleteCommandTimerRequestSchema = {
  body: DeleteCommandTimerRequest
};

export const DeleteCommandTimerSchema = z.object({
  body: z.object({
    id: z.number().min(1),
  }),
}) satisfies z.Schema<DeleteCommandTimerRequestSchema>;
