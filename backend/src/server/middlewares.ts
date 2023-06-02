import { LOGLVL } from '#lib/display';
import { display } from '#lib/display';
import chalk from 'chalk';
import { RequestHandler } from 'express';


export const logger: RequestHandler = (req, res, next) => {
  display.log(LOGLVL.INFO,
    chalk.bold.yellow(req.method),
    chalk.bold.green(req.hostname),
    req.url,
  );
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
