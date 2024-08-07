import { Request } from 'express';
import { Middleware } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { AnyZodObject, z, ZodError, ZodObject, ZodTypeAny } from 'zod';
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
      const invalidFields = error.issues.map((issue) => issue.path.at(-1));

      throw new ServerError(
        HttpCodes.BadRequest,
        `Invalid or missing input${invalidFields.length > 1 ? 's' : ''
        } provided for: ${invalidFields.join(', ')}`,
        {
          errors: error.issues,
        },
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
  <T extends ZodTypeAny>(schema: T): Middleware<never, object, object, object, { jsonValidated: (body: z.infer<T>) => void }> => async (req, res) => {
    const temp = Object.assign(res, {
      jsonValidated: (body: unknown) => {
        const validated = schema.parse(body);

        return res.json.call(res, validated);
      },
    });

    return [req, temp];
  };

type ControllerWithGetById = {
  getById: (id: number) => Promise<object | null>;
};

// eslint-disable-next-line max-len
export const queryResource = <K extends string, T extends ControllerWithGetById>(controller: T, parameter: K): Middleware<never, { validated: { params: { [K: string]: number } } }, object, { resource: NonNullable<Awaited<ReturnType<T['getById']>>> }> => async (req, res) => {
  if (typeof req.validated.params[parameter] !== 'number') throw new ServerError(HttpCodes.BadRequest, `Invalid parameter :${parameter}`);

  const instance = await controller.getById(req.validated.params[parameter]) as Awaited<ReturnType<T['getById']>>;
  if (!instance) throw new ServerError(HttpCodes.NotFound, 'Not Found');

  const temp = Object.assign(req, { resource: instance });

  return [temp, res];
};

// eslint-disable-next-line max-len
export const checkResourceOwnership = <K extends string>(key: K): Middleware<void, { resource: { [K: string]: unknown }, user: Exclude<Request['user'], undefined> }, object> => (req) => {
  if (req.resource[key] !== req.user.id) throw new ServerError(HttpCodes.Forbidden, 'Forbidden');
};
