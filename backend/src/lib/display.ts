import chalk, { Chalk } from 'chalk';
import { timeDisplay } from './timeLib';
import util from 'util';


interface Display {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any,
  disabled: boolean,
  type: string,
  logLevel: LOGLVL,
  debug: Display,
  system: Display,
  info: Display,
  warning: Display,
  error: Display,
  nextLine(name: string | false, ...args: unknown[]): void,
  sameLine(name: string | false, ...args: unknown[]): void,
  log(level: number, ...msg: unknown[]): void,
  setLogLevel(level: LOGLVL): void,
  time(name: string, start: number, finish?: number): void;
}

enum LOGLVL {
  SPAM,
  ADMIN,
  INFO,
  IMPORTANT,
}

const displayOptions = {
  colors: true,
  depth: Infinity,
  breakLength: process.stdout.columns,
};

const display: Display = {
  type: '_system',
  logLevel: LOGLVL.SPAM,
  disabled: false,

  get debug() {
    this.type = '_debug';
    return this;
  },
  get system() {
    this.type = '_system';
    return this;
  },
  get info() {
    this.type = '_info';
    return this;
  },
  get warning() {
    this.type = '_warning';
    return this;
  },
  get error() {
    this.type = '_error';
    return this;
  },

  universalFormat(formatter: Chalk, args: unknown[]): unknown[] {
    return args.map((a) => {
      if (typeof a === 'string') return formatter(a);
      return a;
    });
  },

  _debug(name: string| boolean, args: unknown[]) {
    return [
      (name !== false ? `[${chalk.grey.bold(name)}]:` : ''),
      ...this.universalFormat(chalk.grey, args),
    ];
  },

  _system(name: string| boolean, args: unknown[]) {
    return [
      (name !== false ? `[${chalk.white.bold(name)}]:` : ''),
      ...this.universalFormat(chalk.white, args),
    ];
  },

  _info(name: string| boolean, args: unknown[]) {
    return [
      (name !== false ? `[${chalk.blue.bold(name)}]:` : ''),
      ...this.universalFormat(chalk.blue, args),
    ];
  },

  _warning(name: string| boolean, args: unknown[]) {
    return [
      (name !== false ? `[${chalk.keyword('orange').bold(name)}]:` : ''),
      ...this.universalFormat(chalk.keyword('orange'), args),
    ];
  },

  _error(name: string| boolean, args: unknown[]) {
    return [
      (name !== false ? `[${chalk.red.bold(name)}]:` : ''),
      ...this.universalFormat(chalk.red, args),
    ];
  },

  nextLine(name: string | false, ...args: unknown[]) {
    if (args.length === 0 || (this.disabled && this.type !== '_error')) return;
    process.stdout.write(util.formatWithOptions(displayOptions, ...this[this.type](name, args), '\n'));
  },

  sameLine(name: string | false, ...args: unknown[]) {
    if (args.length === 0 || (this.disabled && this.type !== '_error')) return;
    process.stdout.write(util.formatWithOptions(displayOptions, ...this[this.type](name, args)));
  },

  log(level: LOGLVL, ...msg: unknown[]) {
    if (level >= this.logLevel) {
      if (level === LOGLVL.IMPORTANT) {
        process.stdout.write(util.formatWithOptions(displayOptions, timeDisplay(), ...this.universalFormat(chalk.cyan, msg), '\n'));
      } else {
        process.stdout.write(util.formatWithOptions(displayOptions, timeDisplay(), ...msg, '\n'));
      }
    }
  },

  setLogLevel(level: LOGLVL): void {
    display.info.nextLine('display:setLogLevel', 'Changed logging level from', LOGLVL[this.logLevel], '=>', LOGLVL[level]);
    this.logLevel = level;
  },

  time(name: string, start: number, finish = performance.now()): void {
    display.debug.nextLine('Timer', name, 'took', finish - start, 'ms');
  },
};

export {
  display,
  LOGLVL,
};
