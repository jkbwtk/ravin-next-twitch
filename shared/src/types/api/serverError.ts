import { z } from 'zod';


export const ServerErrorResponse = z.object({
  message: z.string(),
});

export type ServerErrorResponse = z.infer<typeof ServerErrorResponse>;
