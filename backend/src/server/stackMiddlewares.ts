import { Request } from 'express';
import { Middleware } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { AnyZodObject, z, ZodError } from 'zod';
import { Signal } from '#shared/utils';
import { isDevMode } from '#shared/constants';

export const authenticated: Middleware<object, object, {
  user: Exclude<Request['user'], undefined>;
}> = (req, res, next) => {
  if (req.isUnauthenticated()) throw new ServerError(401, 'Unauthorized');
  if (req.user === undefined) throw new ServerError(401, 'Unauthorized');

  const authReq = req as typeof req & { user: Exclude<typeof req['user'], undefined> };

  return [authReq, res, next];
};

export const admin: Middleware<{
  user: Exclude<Request['user'], undefined>;
}, object, object, object, void> = (req, res, next) => {
  if (req.user.admin === false) throw new ServerError(403, 'Forbidden');
};

export const validate = <T extends AnyZodObject>(schema: T): Middleware<object, object, { validated: z.infer<T> }> => async (req, res, next) => {
  try {
    const validated = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    const temp = Object.assign(req, { validated });

    return [temp, res, next];
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

export const requireDevMode: Middleware<object, object, object, object, void> = (req, res, next) => {
  if (!isDevMode) throw new ServerError(404, 'Not Found');
};

export const waitUntilReady = (signal: Signal<boolean>): Middleware<object, object, object, object, void> => (req, res, next) => {
  if (!signal()) throw new ServerError(503, 'Service Temporarily Unavailable');
};
