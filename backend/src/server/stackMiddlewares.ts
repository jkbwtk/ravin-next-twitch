import { Request } from 'express';
import { Middleware } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { AnyZodObject, z, ZodError } from 'zod';

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
}> = (req, res, next) => {
  if (req.user.admin === false) throw new ServerError(403, 'Forbidden');

  return [req, res, next];
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
