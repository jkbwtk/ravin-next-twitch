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
export type ModelControllerCompatible = Record<string, (...args: any[]) => Awaitable<any>>;

export type SignalDispatcher<T extends ModelControllerCompatible> = {
  registeredBefore: Map<keyof T, Set<((...params: Parameters<T[keyof T]>) => void)>>;
  registeredAfter: Map<keyof T, Set<((result: ReturnType<T[keyof T]>, ...params: Parameters<T[keyof T]>) => void)>>;

  registerBefore<K extends keyof T>(name: K, callback: (...params: Parameters<T[K]>) => void): void;
  registerAfter<K extends keyof T>(name: K, callback: (result: ReturnType<T[K]>, ...params: Parameters<T[K]>) => void): void;

  unregisterBefore<K extends keyof T>(name: K, callback: (...params: Parameters<T[K]>) => void): void;
  unregisterAfter<K extends keyof T>(name: K, callback: (result: ReturnType<T[K]>, ...params: Parameters<T[K]>) => void): void;

};


export type SignalDispatcherMixin<T extends ModelControllerCompatible> = T & { $signals: SignalDispatcher<T> };

export const applySignalDispatcherMixin = <T extends ModelControllerCompatible & {}>(target: T): SignalDispatcherMixin<T> => ({
  ...target,

  $signals: {
    registeredBefore: new Map(),
    registeredAfter: new Map(),

    registerBefore(name, callback) {
      let set = this.registeredBefore.get(name);

      if (set === undefined) {
        this.registeredBefore.set(name, new Set([callback]));
      } else {
        set.add(callback);
      }
    },
    registerAfter(name, callback) {
      let set = this.registeredAfter.get(name);

      if (set === undefined) {
        this.registeredAfter.set(name, new Set([callback]));
      } else {
        set.add(callback);
      }
    },

    unregisterBefore(name, callback) {
      let set = this.registeredBefore.get(name);
      if (set !== undefined) set.delete(callback);
    },
    unregisterAfter(name, callback) {
      let set = this.registeredAfter.get(name);
      if (set !== undefined) set.delete(callback);
    },
  },
});


export const convertToControllerProxy = <T extends ModelControllerCompatible>(name: string, controller: T): T & SignalDispatcherMixin<T> => new Proxy(
  applySignalDispatcherMixin(controller), {
    get(target, prop) {
      if (typeof prop === 'symbol' || !Object.keys(target).includes(prop) || prop.toString().startsWith('$')) {
        return Reflect.get(target, prop);
      }

      const beforeCallbacks = target.$signals.registeredBefore.get(prop as keyof T) ?? [];
      const afterCallbacks = target.$signals.registeredAfter.get(prop as keyof T) ?? [];

      return async (...args: unknown[]) => {
        for (const callback of beforeCallbacks) {
          // @ts-expect-error this could be casted
          callback(...args);
        }

        const result = await timeQuery(
          Reflect.get(target, prop)(...args),
          {
            operation: String(prop),
            model: name,
            args,
          });

        for (const callback of afterCallbacks) {
          // @ts-expect-error this could be casted
          callback(result, ...args);
        }

        return result;
      };
    },
  });
