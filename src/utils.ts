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
