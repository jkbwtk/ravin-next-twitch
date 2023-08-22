import { AsyncLike } from '#lib/utils';
import { RequestHandler as BaseRequestHandler, NextFunction, Request, Response } from 'express';
import { ParamsDictionary, RouteParameters } from 'express-serve-static-core';


type RequestHandler<P = ParamsDictionary> = BaseRequestHandler<P, unknown, unknown>;

export type Middleware<
  OverrideReq = object,
  OverrideRes = object,
  OverrideRetReq = object,
  OverrideRetRes = object,
> = <
  Req extends Request,
  Res extends Response,
>(
  req: Req & OverrideReq,
  res: Res & OverrideRes,
  next: NextFunction
) => AsyncLike<[Req & OverrideRetReq, Res & OverrideRetRes, NextFunction]>;

export class ExpressStack<
  Route extends string,
  P = RouteParameters<Route>,
  H extends Parameters<RequestHandler<P>> = Parameters<RequestHandler<P>>,
> {
  public readonly url: Route;

  private expressMiddlewares: RequestHandler[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stackMiddlewares: Middleware<any, any, any, any>[] = [];
  constructor(url: Route = '' as Route, ...expressMiddlewares: RequestHandler[]) {
    this.url = url;
    this.expressMiddlewares = expressMiddlewares;
  }

  public unwrap(): Array<RequestHandler<P> | RequestHandler> {
    return [...this.expressMiddlewares, this.execute.bind(this)];
  }

  public use<
    R extends AsyncLike<Parameters<RequestHandler<P>>>
  >(func: (
    req: H['0'],
    res: H['1'],
    next: H['2']
  ) => R): ExpressStack<Route, P, Awaited<R>> {
    this.stackMiddlewares.push(func);

    return this as unknown as ExpressStack<Route, P, Awaited<R>>;
  }

  public useNative(middleware: RequestHandler): this {
    this.expressMiddlewares.push(middleware);

    return this;
  }

  public execute: RequestHandler<P> = async (req, res, next) => {
    let request = req; let response = res; let nextFunc = next;

    try {
      for (const middleware of this.stackMiddlewares) {
        [request, response, nextFunc] = await middleware(request, response, nextFunc);
      }
    } catch (error) {
      next(error);
    }
  };
}


