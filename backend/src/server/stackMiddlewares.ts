import { Request } from 'express';
import { Middleware } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { AnyZodObject, z, ZodError, ZodObject } from 'zod';
import { isDevMode } from '#shared/constants';
import { HttpCodes } from '#shared/httpCodes';


export const authenticated: Middleware<never, object, object, {
  user: Exclude<Request['user'], undefined>;
}> = (req, res) => {
  if (req.isUnauthenticated()) throw new ServerError(HttpCodes.Unauthorized, 'Unauthorized');
  if (req.user === undefined) throw new ServerError(HttpCodes.Unauthorized, 'Unauthorized');

  const authReq = req as typeof req & { user: Exclude<typeof req['user'], undefined> };

  return [authReq, res];
};

export const admin: Middleware<void, {
  user: Exclude<Request['user'], undefined>;
}> = (req) => {
  if (req.user.admin === false) throw new ServerError(HttpCodes.Forbidden, 'Forbidden');
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
        HttpCodes.BadRequest,
        `Invalid or missing input${
          invalids.length > 1 ? 's' : ''
        } provided for: ${invalids.join(', ')}`,
      );
    } else {
      throw new ServerError(HttpCodes.BadRequest, 'Invalid input');
    }
  }
};

export const requireDevMode: Middleware<void> = () => {
  if (!isDevMode) throw new ServerError(HttpCodes.NotFound, 'Not Found');
};

export const waitUntilReady = (signal: () => boolean): Middleware<void> => () => {
  if (!signal()) throw new ServerError(HttpCodes.ServiceUnavailable, 'Service Temporarily Unavailable');
};

export const validateResponse =
  <T extends AnyZodObject>(schema: T): Middleware<never, object, object, object, { jsonValidated: (body: z.infer<T>) => void }> => async (req, res) => {
    const temp = Object.assign(res, {
      jsonValidated: (body: unknown) => {
        const validated = schema.parse(body);

        return res.json.call(res, validated);
      },
    });

    return [req, temp];
  };
