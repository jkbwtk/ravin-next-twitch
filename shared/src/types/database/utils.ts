type UtilityRows = 'createdAt' | 'updatedAt';

export type StripUtilityRows<T> = Omit<T, UtilityRows>;

export type InferCreate<T> = Omit<T, 'id'>;

export type InferUpdate<T extends { id?: unknown }> = {
  id: NonNullable<T['id']>;
} & {
  [K in keyof T as Exclude<K, 'id'>]?: T[K];
};

export type InferDelete<T extends { id?: unknown }> = {
  id: NonNullable<T['id']>;
};

