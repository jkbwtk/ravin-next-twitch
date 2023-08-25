import { AsyncLike } from '#lib/utils';
import { RequestHandler as BaseRequestHandler, NextFunction, Request, Response } from 'express';
import { ParamsDictionary, RouteParameters } from 'express-serve-static-core';


type RequestHandler<P = ParamsDictionary> = BaseRequestHandler<P, unknown, unknown>;
type PramsRequestHandler<U = unknown, P = ParamsDictionary> = (
  params: U,
  req: Request<P>,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
type ChoseNonVoid<A, B> = A extends void | AsyncLike<void> | Promise<void> ? B : A;

type RequestHandlerParams<Params extends ParamsDictionary> = [Parameters<RequestHandler<Params>>['0'], Parameters<RequestHandler<Params>>['1']];

export type Middleware<
  OptionalVoid extends void | never = never,
  OverrideReq = object,
  OverrideRes = object,
  OverrideRetReq = object,
  OverrideRetRes = object,
  UnwrapParams = unknown,
> = <
  Req extends Request,
  Res extends Response,
>(
  req: Req & OverrideReq,
  res: Res & OverrideRes,
  params: UnwrapParams
) => AsyncLike<[Req & OverrideReq & OverrideRetReq, Res & OverrideRes & OverrideRetRes] | OptionalVoid>;

export class ExpressStack<
  UnwrapParams = void,
  Route extends string = '',
  Params extends ParamsDictionary = RouteParameters<Route>,
  HandlerParams extends RequestHandlerParams<Params> = RequestHandlerParams<Params>,
> {
  public readonly url: Route;

  private expressMiddlewares: RequestHandler[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stackMiddlewares: Middleware<void, any, any, any, any, UnwrapParams>[] = [];
  constructor(url: Route = '' as Route, ...expressMiddlewares: RequestHandler[]) {
    this.url = url;
    this.expressMiddlewares = expressMiddlewares;
  }

  public unwrap(params: UnwrapParams): Array<RequestHandler<Params> | PramsRequestHandler> {
    return [...this.expressMiddlewares, this.execute.bind(this, params)];
  }

  public use<
    R extends AsyncLike<RequestHandlerParams<Params> | void>
  >(func: (
    req: HandlerParams['0'],
    res: HandlerParams['1'],
    params: UnwrapParams
  ) => R): ExpressStack<UnwrapParams, Route, Params, ChoseNonVoid<Awaited<R>, HandlerParams>> {
    this.stackMiddlewares.push(func);

    return this as unknown as ExpressStack<UnwrapParams, Route, Params, ChoseNonVoid<Awaited<R>, HandlerParams>>;
  }

  public useNative(middleware: RequestHandler): this {
    this.expressMiddlewares.push(middleware);

    return this;
  }

  public execute: PramsRequestHandler<UnwrapParams, Params> = async (params, req, res, next) => {
    let request = req; let response = res;
    try {
      for (const middleware of this.stackMiddlewares) {
        const middlewareReturn = await middleware(request, response, params);

        if (middlewareReturn) {
          [request, response] = middlewareReturn;
        }
      }
    } catch (error) {
      next(error);
    }
  };
}
