import { AsyncLike } from '#lib/utils';
import { RequestHandler as BaseRequestHandler, NextFunction, Request, Response } from 'express';
import { ParamsDictionary, RouteParameters } from 'express-serve-static-core';


type RequestHandler<P = ParamsDictionary> = BaseRequestHandler<P, unknown, unknown>;
type ChoseNonVoid<A, B> = A extends void | AsyncLike<void> | Promise<void> ? B : A;

export type Middleware<
  OverrideReq = object,
  OverrideRes = object,
  OverrideRetReq = object,
  OverrideRetRes = object,
  OptionalVoid extends void | never = never,
> = <
  Req extends Request,
  Res extends Response,
>(
  req: Req & OverrideReq,
  res: Res & OverrideRes,
  next: NextFunction
) => AsyncLike<[Req & OverrideReq & OverrideRetReq, Res & OverrideRes & OverrideRetRes, NextFunction] | OptionalVoid>;

export class ExpressStack<
  UnwrapParams = void,
  Route extends string = '',
  Params = RouteParameters<Route>,
  HandlerParams extends Parameters<RequestHandler<Params>> = Parameters<RequestHandler<Params>>,
> {
  public readonly url: Route;

  private expressMiddlewares: RequestHandler[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stackMiddlewares: Middleware<any, any, any, any, void>[] = [];
  constructor(url: Route = '' as Route, ...expressMiddlewares: RequestHandler[]) {
    this.url = url;
    this.expressMiddlewares = expressMiddlewares;
  }

  public unwrap(): Array<RequestHandler<Params> | RequestHandler> {
    return [...this.expressMiddlewares, this.execute.bind(this)];
  }

  public use<
    R extends AsyncLike<Parameters<RequestHandler<Params>> | void>
  >(func: (
    req: HandlerParams['0'],
    res: HandlerParams['1'],
    next: HandlerParams['2']
  ) => R): ExpressStack<UnwrapParams, Route, Params, ChoseNonVoid<Awaited<R>, HandlerParams>> {
    this.stackMiddlewares.push(func);

    return this as unknown as ExpressStack<UnwrapParams, Route, Params, ChoseNonVoid<Awaited<R>, HandlerParams>>;
  }

  public useNative(middleware: RequestHandler): this {
    this.expressMiddlewares.push(middleware);

    return this;
  }

  public execute: RequestHandler<Params> = async (req, res, next) => {
    let request = req; let response = res; let nextFunc = next;
    try {
      for (const middleware of this.stackMiddlewares) {
        const middlewareReturn = await middleware(request, response, nextFunc);

        if (middlewareReturn) {
          [request, response, nextFunc] = middlewareReturn;
        }
      }
    } catch (error) {
      next(error);
    }
  };
}
