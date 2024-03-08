import { Logger } from '#lib/logger/Logger';
import { ConsoleOutput } from '#lib/logger/outputs/ConsoleOutput';
import { FileOutput } from '#lib/logger/outputs/FileOutput';
import { ARGS, LEVEL, MESSAGE, TransformableEntry } from '#lib/logger/types';
import chalk from 'chalk';
import { duration } from 'dayjs';


export type HTTPLogEntry = {
  method: string;
  remoteAddress: string;
  url: string;
  httpVersion: string;
  referer: string | null;
  userAgent: string | null;
  statusCode: number;
  statusMessage: string;
  contentLength: number;
  responseTime: number;
  totalTime: number;
};

const colorStrings = (color: typeof chalk.white, entry: TransformableEntry) => {
  const args = entry[ARGS].map((arg) => {
    if (typeof arg === 'string') return color(arg);
    return arg;
  });

  entry[ARGS] = args;

  return entry;
};

const colorUrl = (url: string) => {
  const coloredSlash = chalk.bold.white('/');
  return url.replaceAll('/', coloredSlash);
};

const prettyRequest = (requestLevel: string, entry: TransformableEntry) => {
  if (entry[LEVEL] !== requestLevel) return entry;

  const request = entry.request as HTTPLogEntry;

  let message = '';

  message += `${chalk.bold.yellow(request.method)} ${chalk.bold.italic`HTTP/${request.httpVersion}`} ${colorUrl(request.url)}`;
  message += `${chalk.gray(' - ')}`;
  message += `${chalk.green.bold(request.remoteAddress)}`;
  message += `${chalk.gray(' - ')}`;
  message += `${chalk.bold.italic(request.referer ?? '-')}`;
  message += `${chalk.gray(' - ')}`;
  message += `${chalk.blue.bold(request.statusCode)} ${chalk.blue.italic(request.statusMessage)}`;
  message += `${chalk.gray(' - ')}`;
  message += chalk.magenta`resp: ${chalk.bold.italic`${request.responseTime.toFixed(3)}ms`} `;
  message += chalk.magenta`total: ${chalk.bold.italic`${request.totalTime.toFixed(3)}ms`}`;
  message += `${chalk.gray(' - ')}`;
  message += chalk.cyan`${(chalk.bold.italic(request.contentLength))} bytes`;
  message += `${chalk.gray(' - ')}`;
  message += chalk.italic`${request.userAgent ?? '-'}`;

  entry.message = message;

  return entry;
};

const fileJsonFormat = Logger.createOutputAssembler()
  .chain(Logger.json.bind(null, { space: 0 }))
  .chain(Logger.removeColors);

const prettyFormat = Logger.createOutputAssembler()
  .chain(prettyRequest.bind(null, 'http'))
  .chain(Logger.pretty);

const instance = new Logger({
  levels: {
    error: {
      level: 0,
      color: 'red',
    },
    warn: {
      level: 1,
      color: 'yellow',
    },
    info: {
      level: 2,
      color: 'green',
    },
    http: {
      level: 3,
      color: 'gray',
    },
    verbose: {
      level: 4,
      color: 'cyan',
    },
    debug: {
      level: 5,
      color: 'blue',
    },
    time: {
      level: 6,
      color: 'gray',
    },
  },
  format: Logger.createFormatAssembler()
    .chain(colorStrings.bind(null, chalk.cyan))
    .chain(Logger.processArgs)
    .chain(Logger.processSplats)
    .chain(Logger.processError.bind(null, 'error'))
    .chain(Logger.addMetadata),
  outputs: [
    new ConsoleOutput({
      format: prettyFormat,
      level: [
        'error',
        'warn',
        'info',
        // 'http',
        'verbose',
        'debug',
        'time',
      ],
    }),
    // new FileOutput({
    //   format: fileJsonFormat,
    //   level: Infinity,
    //   filename: 'combined_json.log',
    //   directory: 'logs',
    //   rotationFormat: FileOutput.rotateDate,
    //   maxAge: duration({ days: 7 }),
    // }),
    // new FileOutput({
    //   format: fileJsonFormat,
    //   level: [
    //     'error',
    //     'warn',
    //   ],
    //   filename: 'important_json.log',
    //   directory: 'logs',
    //   rotationFormat: FileOutput.rotateDate,
    // }),
    // new FileOutput({
    //   format: prettyFormat
    //     .copy()
    //     .chain(Logger.removeColors),
    //   level: [
    //     'error',
    //     'warn',
    //   ],
    //   filename: 'important_human.log',
    //   directory: 'logs',
    //   rotationFormat: FileOutput.rotateDate,
    // }),
    // new FileOutput({
    //   format: prettyFormat
    //     .copy()
    //     .chain(Logger.removeColors),
    //   level: Infinity,
    //   filename: 'combined_human.log',
    //   directory: 'logs',
    //   rotationFormat: FileOutput.rotateDate,
    //   maxFiles: 5,
    // }),
  ],
}).registerLevelFunction('http', (callback, level, request: HTTPLogEntry) => {
  if (level !== 'http') return;

  callback({
    level,
    message: 'HTTP Request',
    request: Object.assign({}, request),
    [LEVEL]: level,
    [MESSAGE]: 'HTTP Request',
    [ARGS]: [],
  });
}).registerLevelFunction('time', (callback, level, name: string, start: number, finish: number = performance.now()) => {
  if (level !== 'time') return;

  const message = chalk.gray`Timer ${name} took %o ${chalk.gray`ms`}`;

  callback({
    level,
    message,
    [LEVEL]: level,
    [MESSAGE]: message,
    [ARGS]: [finish - start],
  });
});


export const logger = instance.logFunctions;
