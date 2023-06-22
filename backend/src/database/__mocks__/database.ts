import Redis from 'ioredis';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { ExtendedPrismaClient } from '#database/database';


beforeEach(() => {
  mockReset(prisma);
  mockReset(redis);
});

export const redis = mockDeep<Redis>();
export const prisma = mockDeep<ExtendedPrismaClient>();
