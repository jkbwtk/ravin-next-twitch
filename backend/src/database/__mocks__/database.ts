import { db as dbReal, redis as redisReal } from '#database/database';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';


export const redis = mockDeep<typeof redisReal>();
export const db = mockDeep<typeof dbReal>();

beforeEach(() => {
  mockReset(redis);
  mockReset(db);
});
