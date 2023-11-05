import { getVerboseName, HttpCodes, VerboseHttpCodes } from './httpCodes';


export class ServerError extends Error {
  public code: HttpCodes;

  constructor(code: HttpCodes, message: string) {
    super(message);

    this.name = 'ServerError';
    this.code = code;
  }

  public getVerboseName(): VerboseHttpCodes {
    return getVerboseName(this.code);
  }
}
