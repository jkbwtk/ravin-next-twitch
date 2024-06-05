import { logger, QueryTimerData } from '#lib/logger';
import { Awaitable } from 'vitest';


class MapperArray<T> extends Array<T> {}

export const many = <T extends { id: string | number }>(entry: T | null): MapperArray<T> => {
  return entry === null ? new MapperArray() : new MapperArray(entry);
};

export const aggregateResults = <
  E extends { [key: string]: { id: string | number } | null },
  M extends { id: string | number } & { [key: string]: unknown | unknown[] }
>(results: E[], mapper: (result: E) => M): Array<M> => {
  const map = new Map<string | number, M>();

  for (const result of results) {
    const mapped = mapper(result);

    const existing = map.get(mapped.id);

    if (existing === undefined) {
      map.set(mapped.id, mapped);
      continue;
    }

    for (const [key, value] of Object.entries(mapped)) {
      if (existing && key in existing && value instanceof MapperArray && existing[key] instanceof MapperArray) {
        // @ts-expect-error it should be fine
        existing[key].push(...value);
      }
    }
  }

  return Array.from(map.values());
};

export const timeQuery = async <T>(query: Awaitable<T>, data: QueryTimerData): Promise<T> => {
  const t1 = performance.now();
  const result = await query;
  logger.queryTime(data, t1);
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PerformanceMetricsCompatible = Record<string, (...args: any[]) => Awaitable<any>>;

export const trackQueryPerformance = <T extends PerformanceMetricsCompatible>(name: string, controller: T): T => new Proxy(controller, {
  get(target, prop) {
    return (...args: unknown[]) => timeQuery(
      Reflect.get(target, prop)(...args),
      {
        operation: String(prop),
        model: name,
        args,
      });
  },
});
