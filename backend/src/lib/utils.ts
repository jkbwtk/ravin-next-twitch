import { UUID } from './types';


export const sleep = (time: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const arrayFrom = <T>(variable: T[] | T): T[] => {
  return Array.isArray(variable) ? variable.slice() : [variable];
};

export const setFrom = <T>(variable: T[] | T): Set<T> => {
  return new Set(arrayFrom(variable));
};

export const shortUUID = (uuid: UUID): string => {
  return uuid.substring(0, 8);
};

export const slowCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const isObject = (variable: unknown): boolean => {
  return (typeof variable === 'object' && variable !== null && !Array.isArray(variable));
};

export const isStrOrNumber = (variable: unknown): boolean => {
  return (typeof variable === 'string' || typeof variable === 'number');
};

export const clamp = (min: number, max: number, val: number): number => {
  if (val < min) return min;
  if (val > max) return max;
  return val;
};

export const enumerate = <T>(array: Array<T>): [number, T][] => array.map((v, k) => [k, v]);

// https://stackoverflow.com/questions/48230773/how-to-create-a-partial-like-that-requires-a-single-property-to-be-set/48244432
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

// https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist
export type AtLeastOneOf<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

export const randomAlphanumeric = (length: number): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < length; i += 1) result += chars.charAt(Math.floor(Math.random() * chars.length));

  return result;
};

export const definedOrFail = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`${name} is undefined`);
  }

  return value;
};

export const mapOptionsToArray = <T extends string >(options: Record<T, boolean>): Array<T> => {
  const result: Array<T> = [];

  for (const key in options) {
    if (options[key]) {
      result.push(key);
    }
  }

  return result;
};

export type AsyncLike<T> = T | Promise<T>;
