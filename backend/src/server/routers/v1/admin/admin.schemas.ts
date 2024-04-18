import { PostConfigReqBody } from '#shared/types/api/auth';
import { PatchConfigReqBody } from '#types/api/admin';
import { z } from 'zod';


export const PatchConfigSchema = z.object({
  body: PatchConfigReqBody,
});

export type PatchConfigSchema = z.infer<typeof PatchConfigSchema>;


export const PostPublicConfigSchema = z.object({
  body: PostConfigReqBody,
});

export type PostPublicConfigSchema = z.infer<typeof PostPublicConfigSchema>;
