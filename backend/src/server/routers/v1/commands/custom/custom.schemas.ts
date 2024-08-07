import { PatchCustomCommandReqBody, PostCustomCommandReqBody } from '#types/api/commands';
import { z } from 'zod';


export const PostCustomCommandSchema = z.object({
  body: PostCustomCommandReqBody,
});

export type PostCustomCommandSchema = z.infer<typeof PostCustomCommandSchema>;


export const PatchCustomCommandSchema = z.object({
  body: PatchCustomCommandReqBody,
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});


export const DeleteCustomCommandSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type DeleteCustomCommandSchema = z.infer<typeof DeleteCustomCommandSchema>;
