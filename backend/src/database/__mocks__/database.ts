import { db as dbReal, DrizzleDatabase } from '#database/database';
import Redis from 'ioredis';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(dbReal);
  mockReset(redis);
});

export const redis = mockDeep<Redis>();
export const db = mockDeep<DrizzleDatabase>();
