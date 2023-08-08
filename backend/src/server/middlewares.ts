import { logger } from '#lib/logger';
import { RequestHandler } from 'express';
import onHeaders from 'on-headers';
import onFinished from 'on-finished';


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
      remoteAddress: req.ip,
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
  res.status(404).send('Invalid Route');
};

export const notImplemented: RequestHandler = (req, res) => {
  res.sendStatus(501);
};

export const accessControl: RequestHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('Origin') || '*');
  res.header('Vary', 'Origin');

  next();
};

export const notConfigured: RequestHandler = (req, res) => {
  res.contentType('text/plain');
  res.status(503).send('Server is not configured yet.');
};
