import { DeleteCommandTimerReqBody, PatchCommandTimerReqBody, PostCommandTimerReqBody } from '#shared/types/api/commands';
import { z } from 'zod';


export const PostCommandTimerSchema = z.object({
  body: PostCommandTimerReqBody,
});

export type PostCommandTimerSchema = z.infer<typeof PostCommandTimerSchema>;


export const PatchCommandTimerSchema = z.object({
  body: PatchCommandTimerReqBody,
});

export type PatchCommandTimerSchema = z.infer<typeof PatchCommandTimerSchema>;


export const DeleteCommandTimerSchema = z.object({
  body: DeleteCommandTimerReqBody,
});

export type DeleteCommandTimerSchema = z.infer<typeof DeleteCommandTimerSchema>;
