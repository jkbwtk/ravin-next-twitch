import { quickSwitch } from './utils';


export enum HttpCodes {
  UnknownError = 0,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ImATeapot = 418,
  InternalServerError = 500,
  NotImplemented = 501,
  ServiceUnavailable = 503,
}

export type VerboseHttpCodes = typeof ServerError['verboseHttpCodes'][keyof typeof ServerError['verboseHttpCodes']];

export class ServerError extends Error {
  public code: HttpCodes;

  public static verboseHttpCodes = {
    [HttpCodes.UnknownError]: 'Unknown Error',
    [HttpCodes.BadRequest]: 'Bad Request',
    [HttpCodes.Unauthorized]: 'Unauthorized',
    [HttpCodes.Forbidden]: 'Forbidden',
    [HttpCodes.NotFound]: 'Not Found',
    [HttpCodes.ImATeapot]: 'I\'m A Teapot',
    [HttpCodes.InternalServerError]: 'Internal Server Error',
    [HttpCodes.NotImplemented]: 'Not Implemented',
    [HttpCodes.ServiceUnavailable]: 'Service Unavailable',
  } as const satisfies Record<HttpCodes, string>;

  constructor(code: HttpCodes, message: string) {
    super(message);

    this.name = 'ServerError';
    this.code = code;
  }

  public getVerboseName(): VerboseHttpCodes {
    return ServerError.getVerboseName(this.code);
  }

  public static getVerboseName(code: HttpCodes): VerboseHttpCodes {
    return quickSwitch(code, {
      ...ServerError.verboseHttpCodes,
      default: ServerError.verboseHttpCodes[HttpCodes.UnknownError],
    });
  }
}
