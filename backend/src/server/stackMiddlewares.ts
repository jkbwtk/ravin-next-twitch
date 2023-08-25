import { Request } from 'express';
import { Middleware } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { AnyZodObject, z, ZodError, ZodObject } from 'zod';
import { Signal } from '#shared/utils';
import { isDevMode } from '#shared/constants';

export const authenticated: Middleware<never, object, object, {
  user: Exclude<Request['user'], undefined>;
}> = (req, res) => {
  if (req.isUnauthenticated()) throw new ServerError(401, 'Unauthorized');
  if (req.user === undefined) throw new ServerError(401, 'Unauthorized');

  const authReq = req as typeof req & { user: Exclude<typeof req['user'], undefined> };

  return [authReq, res];
};

export const admin: Middleware<void, {
  user: Exclude<Request['user'], undefined>;
}> = (req) => {
  if (req.user.admin === false) throw new ServerError(403, 'Forbidden');
};

export type ValidatorSchema = ZodObject<{
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}>;

export const validate = <T extends ValidatorSchema>(schema: T): Middleware<never, object, object, { validated: z.infer<T> }> => async (req, res) => {
  try {
    const validated = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    const temp = Object.assign(req, { validated });

    return [temp, res];
  } catch (error) {
    if (error instanceof ZodError) {
      const invalids = error.issues.map((issue) => issue.path.pop());

      throw new ServerError(
        400,
        `Invalid or missing input${
          invalids.length > 1 ? 's' : ''
        } provided for: ${invalids.join(', ')}`,
      );
    } else {
      throw new ServerError(400, 'Invalid input');
    }
  }
};

export const requireDevMode: Middleware<void> = () => {
  if (!isDevMode) throw new ServerError(404, 'Not Found');
};

export const waitUntilReady = (signal: Signal<boolean>): Middleware<void> => () => {
  if (!signal()) throw new ServerError(503, 'Service Temporarily Unavailable');
};
