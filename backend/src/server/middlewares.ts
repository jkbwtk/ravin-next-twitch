import { logger } from '#lib/logger';
import { ServerError } from '#shared/ServerError';
import { ServerErrorResponse } from '#shared/types/api/serverError';
import { ErrorRequestHandler, RequestHandler } from 'express';
import onHeaders from 'on-headers';
import onFinished from 'on-finished';
import { ParamsDictionary } from 'express-serve-static-core';
import { HttpCodes } from '#shared/httpCodes';


declare global {
  namespace Express {
    interface Response {
      requestStart: number;
      responseTime?: number;
    }
  }
}

export const requestLogger: RequestHandler = (req, res, next) => {
  const requestStart = performance.now();

  onHeaders(res, () => {
    res.responseTime = performance.now() - requestStart;
  });

  onFinished(res, (err, ctx) => {
    const totalTime = performance.now() - requestStart;

    if (err) {
      logger.error('Error during request', err);
    }

    logger.http({
      method: req.method,
      remoteAddress: req.ip!,
      url: req.originalUrl ?? req.url,
      httpVersion: req.httpVersion,
      referer: req.headers.referer ?? null,
      userAgent: req.get('User-Agent') ?? null,
      statusCode: res.statusCode,
      statusMessage: ctx.statusMessage,
      contentLength: parseInt(ctx.get('Content-Length') ?? '0', 10),
      responseTime: ctx.responseTime ?? 0,
      totalTime,
    });
  });

  next();
};

export const invalidRoute: RequestHandler = (req, res) => {
  res.contentType('text/plain');
  res.status(HttpCodes.NotFound).send('Invalid Route');
};

export const notImplemented: RequestHandler = (req, res) => {
  res.sendStatus(HttpCodes.NotImplemented);
};

export const accessControl: RequestHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('Origin') || '*');
  res.header('Vary', 'Origin');

  next();
};

export const notConfigured: RequestHandler = (req, res) => {
  res.contentType('text/plain');
  res.status(HttpCodes.ServiceUnavailable).send('Server is not configured yet.');
};

export const catchErrors: ErrorRequestHandler<ParamsDictionary, ServerErrorResponse> = (err, req, res, next) => {
  if (err instanceof ServerError) {
    return res.status(err.code).json({
      message: err.message,
    });
  }

  logger.error('Request processing failed', {
    error: err,
  });

  if (res.headersSent) return next(err);

  res.status(HttpCodes.InternalServerError).json({
    message: 'Internal Server Error',
  });
};
