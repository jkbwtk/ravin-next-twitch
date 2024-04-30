import { getVerboseName, HttpCodes, VerboseHttpCodes } from './httpCodes';


export class ServerError extends Error {
  public code: HttpCodes;

  public details: Record<string, unknown> | undefined;

  constructor(code: HttpCodes, message: string, details?: Record<string, unknown>) {
    super(message);

    this.name = 'ServerError';
    this.code = code;
    this.details = details;
  }

  public getVerboseName(): VerboseHttpCodes {
    return getVerboseName(this.code);
  }
}
