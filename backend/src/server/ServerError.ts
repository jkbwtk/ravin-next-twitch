import { quickSwitch } from '#shared/utils';


export type HTTPErrorType = typeof ServerError.errorTypes[HTTPErrorCode];

export type HTTPErrorCode = keyof typeof ServerError.errorTypes;

export class ServerError extends Error {
  public static readonly errorTypes = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    418: 'I\'m A Teapot',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    503: 'Service Unavailable',
  } as const;

  private static readonly errorTypesWithDefault = {
    ...ServerError.errorTypes,
    default: ServerError.errorTypes[500],
  } as const;

  public type: HTTPErrorType;
  public statusCode: HTTPErrorCode;

  constructor(statusCode: HTTPErrorCode, message: string) {
    super(message);

    this.name = 'ServerError';

    this.statusCode = statusCode;
    this.type = ServerError.getType(statusCode);
  }

  public static getType(statusCode: HTTPErrorCode): HTTPErrorType {
    return quickSwitch<HTTPErrorType, HTTPErrorCode>(statusCode, ServerError.errorTypesWithDefault);
  }
}
