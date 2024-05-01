import { z } from 'zod';

export const ResponseDetails = z.object({
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    path: z.array(z.string().or(z.number())),
  })).optional(),
});

export type ResponseDetails = z.infer<typeof ResponseDetails>;


export const ServerErrorResponse = z.object({
  message: z.string(),
  details: ResponseDetails.optional(),
});

export type ServerErrorResponse = z.infer<typeof ServerErrorResponse>;
