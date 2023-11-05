import { z, ZodTypeAny } from 'zod';
import { ServerError } from '#shared/ServerError';
import { ServerErrorResponse } from '#types/api/serverError';


export type RequestOptions<T extends ZodTypeAny> = RequestInit & {
  schema: T;
};

export const fetchJson = async <T extends ZodTypeAny>(url: string | URL, options: RequestOptions<T>): Promise<z.infer<T>> => {
  const res = await fetch(url, options);

  if (res.headers.get('Content-Type')?.includes('application/json') === false) {
    throw new Error('Expected JSON response');
  }

  const body = await res.json();

  if (!res.ok) {
    const error = ServerErrorResponse.safeParse(body);
    const message = error.success ? error.data.message : ServerError.getVerboseName(res.status);

    throw new ServerError(res.status, message);
  }

  if (options?.schema) {
    return options.schema.parseAsync(body);
  }


  return body;
};
