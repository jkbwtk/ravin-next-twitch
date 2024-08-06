import { db } from '#database/database';
import { logger, QueryTimerData } from '#lib/logger';
import { idListFilterState } from '#server/middlewares/idListFilter';
import { LimitOffsetPaginationState } from '#server/middlewares/pagination';
import { InferCreate, InferDelete, InferUpdate } from '#types/database/utils';
import { and, Column, eq, getTableColumns, inArray, Table } from 'drizzle-orm';
import { Awaitable } from 'vitest';


class MapperArray<T> extends Array<T> {}

export const many = <T extends { id: string | number }>(entry: T | null): MapperArray<T> => {
  return entry === null ? new MapperArray() : new MapperArray(entry);
};

export type SelectOptions = Partial<{
  pagination: LimitOffsetPaginationState | null;
  idListFilter: idListFilterState | null;
  orderBy: {
    [key: string]: 'asc' | 'desc';
  };
}>;

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
export type ModelControllerMethod = (...args: any[]) => Awaitable<any>;

export type ModelControllerMethods = Record<string, ModelControllerMethod>;

export type ModelControllerProperties = Record<string, unknown>;

export type SignalDispatcher<T extends ModelControllerMethods> = {
  registeredBefore: Map<keyof T, Set<((...params: Parameters<T[keyof T]>) => void)>>;
  registeredAfter: Map<keyof T, Set<((result: Awaited<ReturnType<T[keyof T]>>, ...params: Parameters<T[keyof T]>) => void)>>;

  registerBefore<K extends keyof T>(name: K, callback: (...params: Parameters<T[K]>) => void): void;
  registerAfter<K extends keyof T>(name: K, callback: (result: Awaited<ReturnType<T[K]>>, ...params: Parameters<T[K]>) => void): void;

  unregisterBefore<K extends keyof T>(name: K, callback: (...params: Parameters<T[K]>) => void): void;
  unregisterAfter<K extends keyof T>(name: K, callback: (result: Awaited<ReturnType<T[K]>>, ...params: Parameters<T[K]>) => void): void;

};


export type SignalDispatcherMixin<T extends ModelControllerMethods> = T & { $signals: SignalDispatcher<T> };

export const applySignalDispatcherMixin = <T extends ModelControllerMethods>(target: T): SignalDispatcherMixin<T> => ({
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


export const convertToControllerProxy = <M extends ModelControllerMethods, P extends ModelControllerProperties>(
  name: string,
  methods: M,
  properties: P = {} as P,
): P & SignalDispatcherMixin<M> => {
  return new Proxy({ ...properties, ...applySignalDispatcherMixin(methods) }, {
    get(target, prop) {
      if (typeof prop === 'symbol' || !Object.keys(target).includes(prop) || prop.toString().startsWith('$')) {
        return Reflect.get(target, prop);
      }

      const beforeCallbacks = target.$signals.registeredBefore.get(prop as keyof M) ?? [];
      const afterCallbacks = target.$signals.registeredAfter.get(prop as keyof M) ?? [];

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
};


export type SharedMethods<T extends Table & { id: Column }> = {
  getById(id: T['$inferSelect']['id']): Promise<T['$inferSelect'] | null>;
  getAll(): Promise<T['$inferSelect'][]>;

  create(data: InferCreate<T['$inferInsert']>): Promise<T['$inferSelect'] | null>;
  update(data: InferUpdate<T['$inferInsert']>): Promise<T['$inferSelect'] | null>;
  delete(data: InferDelete<T['$inferInsert']>): Promise<T['$inferSelect'] | null>;
};


export const createSharedMethods = <T extends Table & { id: Column }>(table: T): SharedMethods<T> => ({
  async getById(id) {
    const query = db
      .select(getTableColumns(table))
      .from(table)
      .where(eq(table.id, id));

    const result = await query;

    return result.at(0) ?? null;
  },

  async getAll() {
    const query = db
      .select(getTableColumns(table))
      .from(table);

    const result = await query;

    return result;
  },

  async create(data) {
    const query = db
      .insert(table)
      // @ts-expect-error this should work
      .values(data)
      .returning(getTableColumns(table));

    const result = await query;

    return result.at(0) ?? null;
  },

  async update(data) {
    const query = db
      .update(table)
      .set(data)
      .where(eq(table.id, data.id))
      .returning(getTableColumns(table));

    const result = await query;

    return result.at(0) ?? null;
  },

  async delete(data) {
    const query = db
      .delete(table)
      .where(eq(table.id, data.id))
      .returning(getTableColumns(table));

    const result = await query;

    return result.at(0) ?? null;
  },


});


export type SecurityMethods<T extends Table & { id: Column, channelUserId: Column }> = {
  filterOwnedList(userId: string, idList: number[]): Promise<T['id'][]>;
};

export const createSecurityMethods = <T extends Table & { id: Column, channelUserId: Column }>(table: T): SecurityMethods<T> => ({
  // @ts-expect-error this should work
  async filterOwnedList(userId, idList) {
    const query = db
      .select()
      .from(table)
      .where(and(inArray(table.id, idList), eq(table.channelUserId, userId)));

    const result = await query;

    return result.map((row) => row.id);
  },
});
