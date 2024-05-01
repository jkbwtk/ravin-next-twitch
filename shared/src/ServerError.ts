import { ResponseDetails, ServerErrorResponse } from './types/api/serverError';
import { getVerboseName, HttpCodes, VerboseHttpCodes } from './httpCodes';


export class ServerError extends Error {
  public code: HttpCodes;

  public details: ResponseDetails | undefined;

  constructor(code: HttpCodes, message: string, details?: ResponseDetails) {
    super(message);

    this.name = 'ServerError';
    this.code = code;
    this.details = details;
  }

  public getVerboseName(): VerboseHttpCodes {
    return getVerboseName(this.code);
  }

  public serialize(): ServerErrorResponse {
    return {
      message: this.message,
      details: this.details,
    };
  }
}
