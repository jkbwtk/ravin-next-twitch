import { prisma } from '#database/database';
import { beforeEach, expect, test, vi } from 'vitest';
import { prisma as mock } from '#database/__mocks__/database';
import { Config } from '#lib/Config';
import { ExtendedMap } from '#lib/ExtendedMap';

vi.mock('#database/database');


beforeEach(async () => {
  await Config.shadowRestoreAll();
  await Config.clearCache();
});

test('getConfig should return an empty map if there are no entries in the database', async () => {
  mock.config.findMany.mockResolvedValue([]);

  const result = await Config.getConfig();

  expect(result).toEqual(new ExtendedMap());
  expect(prisma.config.findMany).toHaveBeenCalled();
});

test('getConfig should return a map with the entries in the database', async () => {
  mock.config.findMany.mockResolvedValue([
    {
      key: 'key1',
      value: 'value1',
      createdAt: new Date(),
      updatedAt: new Date(),
      destroyedAt: null,
    },
    {
      key: 'key2',
      value: 'value2',
      createdAt: new Date(),
      updatedAt: new Date(),
      destroyedAt: null,
    },
  ]);

  const result = await Config.getConfig();

  expect(result).toEqual(new ExtendedMap([['key1', 'value1'], ['key2', 'value2']]));
  expect(prisma.config.findMany).toHaveBeenCalled();
});

test('get should return the value for an existing key', async () => {
  mock.config.findFirst.mockResolvedValue({
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  });

  const result = await Config.get('key1');

  expect(result).toEqual('value1');
  expect(prisma.config.findFirst).toHaveBeenCalledWith({ where: { key: 'key1' } });
});

test('get should return undefined for a non-existing key', async () => {
  mock.config.findFirst.mockResolvedValue(null);

  const result = await Config.get('key1');

  expect(result).toBeUndefined();
  expect(prisma.config.findFirst).toHaveBeenCalledWith({ where: { key: 'key1' } });
});

test('get should return the shadowed value if it exists', async () => {
  mock.config.findFirst.mockResolvedValue({
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  });

  await Config.shadowSet('key1', 'shadowedValue');

  const result = await Config.get('key1');

  expect(result).toEqual('shadowedValue');
  expect(prisma.config.findFirst).not.toHaveBeenCalled();
});

test('get should return the non-shadowed value if the shadowed value does not exist', async () => {
  mock.config.findFirst.mockResolvedValue({
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  });

  const result = await Config.get('key1');

  expect(result).toEqual('value1');
  expect(prisma.config.findFirst).toHaveBeenCalledWith({ where: { key: 'key1' } });
});

test('getOrFail should return the value for an existing key', async () => {
  mock.config.findFirst.mockResolvedValue({
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  });

  const result = await Config.getOrFail('key1');

  expect(result).toEqual('value1');
  expect(prisma.config.findFirst).toHaveBeenCalledWith({ where: { key: 'key1' } });
});

test('getOrFail should throw an error for a non-existing key', async () => {
  mock.config.findFirst.mockResolvedValue(null);

  await expect(Config.getOrFail('key1')).rejects.toThrow('Config key [key1] does not exist');
  expect(prisma.config.findFirst).toHaveBeenCalledWith({ where: { key: 'key1' } });
});

test('set should create a new entry if the key does not exist', async () => {
  const entity = {
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  mock.config.upsert.mockResolvedValue(entity);

  const result = await Config.set('key1', 'value1');

  expect(result).toEqual(entity);
  expect(prisma.config.upsert).toHaveBeenCalledWith({
    update: { value: 'value1' },
    where: { key: 'key1' },
    create: {
      key: 'key1',
      value: 'value1',
    },
  });
});

test('set should update an existing entry if the key exists', async () => {
  const entity = {
    key: 'key1',
    value: 'value2',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  mock.config.upsert.mockResolvedValue(entity);

  const result = await Config.set('key1', 'value2');

  expect(result).toEqual(entity);
  expect(prisma.config.upsert).toHaveBeenCalledWith({
    update: { value: 'value2' },
    where: { key: 'key1' },
    create: { key: 'key1', value: 'value2' },
  });
});

test('batchSet should create new entries if the keys do not exist', async () => {
  const entity1 = {
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  const entity2 = {
    key: 'key2',
    value: 'value2',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  mock.config.upsert.mockResolvedValueOnce(entity1);
  mock.config.upsert.mockResolvedValueOnce(entity2);
  mock.$transaction.mockImplementation((tx) => tx(mock));

  const result = await Config.batchSet([
    ['key1', 'value1'],
    ['key2', 'value2'],
  ]);

  expect(result).toEqual([entity1, entity2]);
  expect(prisma.$transaction).toHaveBeenCalled();
  expect(prisma.config.upsert).toHaveBeenCalledWith({
    update: { value: 'value1' },
    where: { key: 'key1' },
    create: { key: 'key1', value: 'value1' },
  });
  expect(prisma.config.upsert).toHaveBeenCalledWith({
    update: { value: 'value2' },
    where: { key: 'key2' },
    create: { key: 'key2', value: 'value2' },
  });
});

test('batchSet should update existing entries if the keys exist', async () => {
  const entity1 = {
    key: 'key1',
    value: 'value2',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  const entity2 = {
    key: 'key2',
    value: 'value3',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  mock.config.upsert.mockResolvedValueOnce(entity1);
  mock.config.upsert.mockResolvedValueOnce(entity2);
  mock.$transaction.mockImplementation((tx) => tx(mock));

  const result = await Config.batchSet([
    ['key1', 'value2'],
    ['key2', 'value3'],
  ]);

  expect(result).toEqual([entity1, entity2]);
  expect(prisma.$transaction).toHaveBeenCalled();
  expect(prisma.config.upsert).toHaveBeenCalledWith({
    update: { value: 'value2' },
    where: { key: 'key1' },
    create: { key: 'key1', value: 'value2' },
  });
  expect(prisma.config.upsert).toHaveBeenCalledWith({
    update: { value: 'value3' },
    where: { key: 'key2' },
    create: { key: 'key2', value: 'value3' },
  });
});

test('shadowSet should set the shadowed value for a key', async () => {
  await Config.shadowSet('key1', 'shadowedValue');

  expect(await Config.isShadowed('key1')).toBe(true);
  expect(await Config.get('key1')).toEqual('shadowedValue');
});

test('shadowBatchSet should set the shadowed values for multiple keys', async () => {
  await Config.shadowBatchSet([
    ['key1', 'shadowedValue1'],
    ['key2', 'shadowedValue2'],
  ]);

  expect(await Config.isShadowed('key1')).toBe(true);
  expect(await Config.get('key1')).toEqual('shadowedValue1');
  expect(await Config.isShadowed('key2')).toBe(true);
  expect(await Config.get('key2')).toEqual('shadowedValue2');
});

test('shadowRestore should restore the non-shadowed value for a key', async () => {
  mock.config.upsert.mockResolvedValueOnce({
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  });

  await Config.set('key1', 'value1');

  await Config.shadowSet('key1', 'shadowedValue');
  await Config.shadowRestore('key1');

  expect(await Config.isShadowed('key1')).toBe(false);
  expect(await Config.get('key1')).toEqual('value1');
});

test('shadowBulkRestore should restore the non-shadowed values for multiple keys', async () => {
  const entity1 = {
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  const entity2 = {
    key: 'key2',
    value: 'value2',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  mock.config.upsert.mockResolvedValueOnce(entity1);
  mock.config.upsert.mockResolvedValueOnce(entity2);
  mock.$transaction.mockImplementation((tx) => tx(mock));

  await Config.batchSet([
    ['key1', 'value1'],
    ['key2', 'value2'],
  ]);

  await Config.shadowBatchSet([
    ['key1', 'shadowedValue1'],
    ['key2', 'shadowedValue2'],
  ]);
  await Config.shadowBulkRestore(['key1', 'key2']);

  expect(await Config.isShadowed('key1')).toBe(false);
  expect(await Config.get('key1')).toEqual('value1');
  expect(await Config.isShadowed('key2')).toBe(false);
  expect(await Config.get('key2')).toEqual('value2');
});

test('shadowRestoreAll should restore the non-shadowed values for all keys', async () => {
  const entity1 = {
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  const entity2 = {
    key: 'key2',
    value: 'value2',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  mock.config.upsert.mockResolvedValueOnce(entity1);
  mock.config.upsert.mockResolvedValueOnce(entity2);
  mock.$transaction.mockImplementation((tx) => tx(mock));

  await Config.batchSet([
    ['key1', 'value1'],
    ['key2', 'value2'],
  ]);

  await Config.shadowBatchSet([
    ['key1', 'shadowedValue1'],
    ['key2', 'shadowedValue2'],
  ]);
  await Config.shadowRestoreAll();

  expect(await Config.isShadowed('key1')).toBe(false);
  expect(await Config.get('key1')).toEqual('value1');
  expect(await Config.isShadowed('key2')).toBe(false);
  expect(await Config.get('key2')).toEqual('value2');
});

test('delete should delete an entry for a key', async () => {
  const entity = {
    key: 'key1',
    value: 'value1',
    createdAt: new Date(),
    updatedAt: new Date(),
    destroyedAt: null,
  };

  mock.config.upsert.mockResolvedValueOnce(entity);

  await Config.set('key1', 'value1');
  await Config.delete('key1');

  expect(await Config.get('key1')).toBeUndefined();
  expect(prisma.config.delete).toHaveBeenCalledWith({ where: { key: 'key1' } });
});
