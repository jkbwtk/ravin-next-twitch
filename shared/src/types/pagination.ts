import { z } from 'zod';


export const PaginatedResponseMetadata = z.object({
  total: z.number().gte(0).int(),
  limit: z.number().gte(0).int(),
  offset: z.number().gte(0).int(),
});

export type PaginatedResponseMetadata = z.infer<typeof PaginatedResponseMetadata>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const PaginatedResponse = <T extends z.ZodRawShape>(response: z.ZodObject<T>) => response.merge(PaginatedResponseMetadata);

export type PaginatedResponse<T extends z.ZodRawShape> = z.infer<ReturnType<typeof PaginatedResponse<T>>>;
