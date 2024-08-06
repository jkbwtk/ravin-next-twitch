import { PatchBehaviorProfileReqBody, PostBehaviorProfileReqBody } from '#types/api/behaviorProfiles';
import { z } from 'zod';


export const PostBehaviorProfileSchema = z.object({
  body: PostBehaviorProfileReqBody,
});

export type PostBehaviorProfileSchema = z.infer<typeof PostBehaviorProfileSchema>;


export const PatchBehaviorProfileSchema = z.object({
  body: PatchBehaviorProfileReqBody,
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type PatchBehaviorProfileSchema = z.infer<typeof PatchBehaviorProfileSchema>;


export const DeleteBehaviorProfileSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type DeleteBehaviorProfileSchema = z.infer<typeof DeleteBehaviorProfileSchema>;
