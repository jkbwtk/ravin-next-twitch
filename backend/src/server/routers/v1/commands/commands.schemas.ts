import { DeleteCustomCommandRequest, PatchCustomCommandRequest, PostCustomCommandRequest, UserLevel } from '#shared/types/api/commands';
import { z } from 'zod';


export type PostCustomCommandRequestSchema = {
  body: PostCustomCommandRequest;
};

const CustomCommandSchemaBase = z.object({
  command: z.string().min(1).max(64),
  response: z.string().min(1).max(512),
  userLevel: z.nativeEnum(UserLevel),
  cooldown: z.number().int().min(0).max(86400).multipleOf(5),
  enabled: z.boolean(),
}) satisfies z.Schema<PostCustomCommandRequest>;

export const PostCustomCommandSchema = z.object({
  body: CustomCommandSchemaBase,
}) satisfies z.Schema<PostCustomCommandRequestSchema>;

export type PatchCustomCommandRequestSchema = {
  body: PatchCustomCommandRequest;
};

export const PatchCustomCommandSchema = z.object({
  body: z.object({
    id: z.number().min(1),
  }).merge(CustomCommandSchemaBase.partial()),
}) satisfies z.Schema<PatchCustomCommandRequestSchema>;

export type DeleteCustomCommandRequestSchema = {
  body: DeleteCustomCommandRequest
};

export const DeleteCustomCommandSchema = z.object({
  body: z.object({
    id: z.number().min(1),
  }),
}) satisfies z.Schema<DeleteCustomCommandRequestSchema>;
