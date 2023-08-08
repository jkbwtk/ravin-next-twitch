import { Assembler } from '#lib/Assembler';
import { Logger } from '#lib/logger/Logger';
import { LoggerOutput } from '#lib/logger/outputs/LoggerOutput';
import chalk from 'chalk';
import { Replacer, StringifyOptions } from 'safe-stable-stringify';


export const LEVEL = Symbol.for('level');
export const MESSAGE = Symbol.for('message');
export const ARGS = Symbol.for('args');

export type LogLevel = {
  level: number;
  color: LogColors;
};

export type LogLevels = Record<string | number | symbol, LogLevel>;

export type LogCallback = (entry: TransformableEntry) => void;

export type AllowedLoggerTypes<T extends Partial<LoggerOptions>> = string
| number
| Array<unknown>
| Error
| null
| undefined
| Partial<Omit<LogEntry<T>, 'level' | 'args' | 'label'>>
| object
| Set<unknown>
| Map<unknown, unknown>;

export type LogColors = 'white'
| 'gray'
| 'yellow'
| 'red'
| 'green'
| 'cyan'
| 'blue'
| 'magenta'
| 'black'
| typeof chalk.white;

export type LevelFunction<
  T extends Partial<LoggerOptions>,
  P extends unknown[]
> = (callback: LogCallback, level: keyof MergedOptions<T>['levels'], ...args: P) => void;

export type OmitMetadata<F> = F extends (callback: never, level: never, ...args: infer P) => infer R ? (...args: P) => R : () => void;

export type LogEntry<T extends Partial<LoggerOptions>> = {
  level: keyof MergedOptions<T>['levels'];
  message: string;
  label?: string | number | (string | number)[];
  args?: AllowedLoggerTypes<T>[];
  error?: Error | string | unknown;
  [key: string]: unknown;
};

export type TransformableEntry = {
  level: string | number | symbol;
  message: string;
  label?: string | number | (string | number)[];
  [LEVEL]: string | number | symbol;
  [MESSAGE]: string;
  [ARGS]: AllowedLoggerTypes<LoggerOptions>[];
  [key: string]: unknown;
};

export type LoggerOptions = {
  levels: LogLevels;
  format: Assembler<TransformableEntry, LoggerOptions, TransformableEntry>;
  outputs: LoggerOutput[];
};

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type DefaultLoggerOptions = typeof Logger.defaultOptions;

export type MergedOptions<T extends Partial<LoggerOptions>> = Required<Overwrite<DefaultLoggerOptions, T>>;

export type LoggerLevelMethods<T extends Partial<LoggerOptions>> = {
  [K in keyof MergedOptions<T>['levels']]: {
    (message: string, ...args: AllowedLoggerTypes<T>[]): void;
    (entry: LogEntry<T>): void;
  }
};

export type LoggerMethods<T extends Partial<LoggerOptions>> = LoggerLevelMethods<T> & {
  log: {
    (level: keyof MergedOptions<T>['levels'], message: string, ...args: AllowedLoggerTypes<T>[]): void;
    (entry: LogEntry<T>): void;
  }
};

export type JsonOptions = StringifyOptions & {
  replacer?: Replacer;
  space?: string | number;
};

export type OutputOptions = {
  format: Assembler<TransformableEntry, LoggerOptions, string>;
  level: string | number | string[];
};
