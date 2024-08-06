import { Tokens } from '#types/twitch';


export class NoTokensFile extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NoTokensFile';
  }
}

export class InvalidTokensSyntax extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidTokensSyntax';
  }
}

export class InvalidAccessToken extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidAccessToken';
  }
}

export class InvalidRefreshToken extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidRefreshToken';
  }
}

export class NotFound extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NotFound';
  }
}

export class NoTokens extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NoTokens';
  }
}

export class TimedOut extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TimedOut';
  }
}

export class TooManyParameters extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TooManyParameters';
  }
}

export class InvalidRequestParameters extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidRequestParameters';
  }
}

export class InternalServerError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InternalServerError';
  }
}
