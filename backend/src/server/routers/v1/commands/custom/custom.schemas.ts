import { DeleteCustomCommandReqBody, PatchCustomCommandReqBody, PostCustomCommandReqBody } from '#shared/types/api/commands';
import { z } from 'zod';


export const PostCustomCommandSchema = z.object({
  body: PostCustomCommandReqBody,
});

export type PostCustomCommandSchema = z.infer<typeof PostCustomCommandSchema>;


export const PatchCustomCommandSchema = z.object({
  body: PatchCustomCommandReqBody,
});


export const DeleteCustomCommandSchema = z.object({
  body: DeleteCustomCommandReqBody,
});

export type DeleteCustomCommandSchema = z.infer<typeof DeleteCustomCommandSchema>;
