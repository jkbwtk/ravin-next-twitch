type UtilityRows = 'createdAt' | 'updatedAt';

export type StripUtilityRows<T> = Omit<T, UtilityRows>;
