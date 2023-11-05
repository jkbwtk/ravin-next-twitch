import { quickSwitch } from './utils';


export type VerboseHttpCodes = typeof verboseHttpCodes[keyof typeof verboseHttpCodes];

export enum HttpCodes {
  UnknownError = 0,
  OK = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  Conflict = 409,
  ImATeapot = 418,
  TooManyRequests = 429,
  InternalServerError = 500,
  NotImplemented = 501,
  ServiceUnavailable = 503,
}

export const verboseHttpCodes = {
  [HttpCodes.UnknownError]: 'Unknown Error',
  [HttpCodes.OK]: 'OK',
  [HttpCodes.Created]: 'Created',
  [HttpCodes.Accepted]: 'Accepted',
  [HttpCodes.NoContent]: 'No Content',
  [HttpCodes.BadRequest]: 'Bad Request',
  [HttpCodes.Unauthorized]: 'Unauthorized',
  [HttpCodes.Forbidden]: 'Forbidden',
  [HttpCodes.NotFound]: 'Not Found',
  [HttpCodes.MethodNotAllowed]: 'Method Not Allowed',
  [HttpCodes.Conflict]: 'Conflict',
  [HttpCodes.ImATeapot]: 'I\'m A Teapot',
  [HttpCodes.TooManyRequests]: 'Too Many Requests',
  [HttpCodes.InternalServerError]: 'Internal Server Error',
  [HttpCodes.NotImplemented]: 'Not Implemented',
  [HttpCodes.ServiceUnavailable]: 'Service Unavailable',
} as const satisfies Record<HttpCodes, string>;

export const getVerboseName = (code: HttpCodes): VerboseHttpCodes => {
  return quickSwitch(code, {
    ...verboseHttpCodes,
    default: verboseHttpCodes[HttpCodes.UnknownError],
  });
};
