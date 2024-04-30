import { z } from 'zod';


export const ServerErrorResponse = z.object({
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type ServerErrorResponse = z.infer<typeof ServerErrorResponse>;
