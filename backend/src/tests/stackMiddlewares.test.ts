/* eslint-disable @typescript-eslint/no-explicit-any */
import { admin, authenticated, validate, waitUntilReady } from '#server/stackMiddlewares';
import { ServerError } from '#shared/ServerError';
import { describe, expect, it, test, vi } from 'vitest';
import { z } from 'zod';


test('authenticated middleware should throw ServerError(401) if req is unauthenticated', () => {
  const req = {
    isUnauthenticated: vi.fn().mockReturnValue(false),
    user: undefined,
  };
  const res = {};

  expect(() => authenticated(req as any, res as any, null)).toThrowError(new ServerError(401, 'Unauthorized'));
});

test('authenticated middleware should throw ServerError(400) if req.user is undefined', () => {
  const req = {
    isUnauthenticated: vi.fn().mockReturnValue(true),
    user: undefined,
  };
  const res = {};

  expect(() => authenticated(req as any, res as any, null)).toThrowError(new ServerError(401, 'Unauthorized'));
});

test('authenticated middleware should return [req, res] if req is authenticated', () => {
  const req = {
    isUnauthenticated: vi.fn().mockReturnValue(false),
    user: { id: 1 },
  };
  const res = {};

  expect(authenticated(req as any, res as any, null)).toEqual([req, res]);
});

test('admin middleware should throw ServerError(403) if req.user.admin is false', () => {
  const req = {
    user: { admin: false },
  };

  const res = {};

  expect(() => admin(req as any, res as any, null)).toThrowError(new ServerError(403, 'Forbidden'));
});

test('admin middleware should do nothing if req.user.admin is true', () => {
  const req = {
    user: { admin: true },
  };

  const res = {};

  expect(() => admin(req as any, res as any, null)).not.toThrow();
});

describe('validate middleware', () => {
  it('should throw ServerError(400) if body validation fails', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });

    const req = {
      body: { name: 1 },
    };

    const res = {};

    await expect(validate(schema)(req as any, res as any, null)).rejects.toThrowError(new ServerError(400, 'Invalid or missing input provided for: name'));
  });

  it('should throw ServerError(400) if query validation fails', async () => {
    const schema = z.object({
      query: z.object({
        id: z.number(),
      }),
    });

    const req = {
      query: { id: '1' },
    };

    const res = {};

    await expect(validate(schema)(req as any, res as any, null)).rejects.toThrowError(new ServerError(400, 'Invalid or missing input provided for: id'));
  });

  it('should throw ServerError(400) if params validation fails', async () => {
    const schema = z.object({
      params: z.object({
        userId: z.number(),
      }),
    });

    const req = {
      params: { userId: '1' },
    };

    const res = {};

    await expect(validate(schema)(req as any, res as any, null)).rejects.toThrowError(new ServerError(400, 'Invalid or missing input provided for: userId'));
  });

  it('should throw ServerError(400) if multiple validations fail', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
        id: z.number(),
        country: z.string(),
      }),
    });

    const req = {
      body: { name: 1 },
    };

    const res = {};

    await expect(validate(schema)(req as any, res as any, null))
      .rejects.toThrowError(new ServerError(400, 'Invalid or missing inputs provided for: name, id, country'));
  });

  it('should return [req, res] if validation passes', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
      query: z.object({
        id: z.number(),
      }),
      params: z.object({
        userId: z.number(),
      }),
    });

    const req = {
      body: { name: 'John' },
      query: { id: 1 },
      params: { userId: 1 },
    };

    const res = {};

    expect(validate(schema)(req as any, res as any, null)).resolves.toEqual([req, res]);
  });

  it('should return validated object in req.validated', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
      query: z.object({
        id: z.coerce.number(),
      }),
      params: z.object({
        userId: z.number(),
      }),
    });

    const req = {
      body: { name: 'test' },
      query: { id: '1' },
      params: { userId: 1 },
    };

    const res = {};

    const [validatedReq] = await validate(schema)(req as any, res as any, null);

    expect(validatedReq.validated).toEqual({
      body: { name: 'test' },
      query: { id: 1 },
      params: { userId: 1 },
    });
  });

  it('should throw ServerError(400) if validation fails completely', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
      query: z.object({
        id: z.number(),
      }),
      params: z.object({
        userId: z.number(),
      }),
    });

    const req = null;

    const res = {};

    await expect(validate(schema)(req as any, res as any, null)).rejects.toThrowError(new ServerError(400, 'Invalid input'));
  });
});

test('waitUntilReady middleware should throw ServerError(503) if signal is false', () => {
  const signal = vi.fn().mockReturnValue(false);

  const req = {};
  const res = {};

  expect(() => waitUntilReady(signal)(req as any, res as any, null)).toThrowError(new ServerError(503, 'Service Temporarily Unavailable'));
});

test('waitUntilReady middleware should do nothing if signal is true', () => {
  const signal = vi.fn().mockReturnValue(true);

  const req = {};
  const res = {};

  expect(() => waitUntilReady(signal)(req as any, res as any, null)).not.toThrow();
});
