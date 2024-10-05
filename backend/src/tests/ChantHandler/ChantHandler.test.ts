import { ChantHandler } from '#bot/handlers/ChantHandler';
import { Constructor } from '#lib/autowire';
import { wire as mockedWire } from '#lib/__mocks__/autowire';
import { describe, it, vi } from 'vitest';
import { ChannelThread } from '#bot/ChannelThread';
import { Client } from 'tmi.js';
import { ChantingSettings } from '#types/database/columns';
import { CacheFIFO } from '#lib/CacheArray';
import { Message } from '#types/database/tables';

vi.mock('#lib/autowire');
vi.mock('#database/database');
vi.mock('#database/controllers/BotActionController');


describe('ChantHandler', () => {
  function mockWires(chantingSettings: ChantingSettings) {
    const fifo = new CacheFIFO<string>(100);
    fifo.push(Math.random().toString());

    const client: Pick<Client, 'say'> = {
      say: () => Promise.resolve([''] as const),
    };

    mockedWire.mockImplementation((caller: unknown, target: Constructor) => {
      if (target === ChannelThread) {
        return {
          channel: {
            chantingSettings,
            userId: '1',
            user: {
              id: '1',
            },
          },
          messages: fifo,
        };
      } else if (target === Client) {
        return client;
      }
    });

    const saySpy = vi.spyOn(client, 'say');

    return [saySpy, fifo] as const;
  }

  function createMessage(channelName: string, userId: string, content: string): Message {
    return {
      badgeInfo: null,
      badges: null,
      channelName,
      channelUserId: '1',
      color: '',
      content,
      createdAt: new Date(),
      displayName: 'test user',
      emotes: null,
      firstMessage: false,
      flags: null,
      id: 1,
      messageType: 'chat',
      mod: false,
      subscriber: false,
      timestamp: new Date(),
      updatedAt: new Date(),
      userId,
      username: 'test_user',
      uuid: '',
    };
  }

  function simulateMessage(fifo: CacheFIFO<string>, handler: ChantHandler, message: Message) {
    handler.handleMessage(false, message);

    fifo.push(message.content);
  }

  it('should be able to create a new instance', async ({ expect }) => {
    mockWires({
      enabled: true,
      interval: 10,
      length: 5,
    });

    expect(() => new ChantHandler({})).toBeDefined();
  });

  it('should not respond if chanting is disabled', async ({ expect }) => {
    const [saySpy, fifo] = mockWires({
      enabled: false,
      interval: 10,
      length: 3,
    });

    const handler = new ChantHandler({});

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    expect(saySpy).not.toBeCalled();
  });

  it('should respond if chanting is enabled', async ({ expect }) => {
    const [saySpy, fifo] = mockWires({
      enabled: true,
      interval: 10,
      length: 3,
    });

    const handler = new ChantHandler({});

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    expect(saySpy).toBeCalled();
  });

  it('should not respond if the chant is not long enough', async ({ expect }) => {
    const [saySpy, fifo] = mockWires({
      enabled: true,
      interval: 10,
      length: 3,
    });

    const handler = new ChantHandler({});

    for (let i = 0; i < 2; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    expect(saySpy).not.toBeCalled();
  });

  it('should not respond again if the chant is already responded', async ({ expect }) => {
    const [saySpy, fifo] = mockWires({
      enabled: true,
      interval: 10,
      length: 3,
    });

    const handler = new ChantHandler({});

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    expect(saySpy).toBeCalled();


    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    expect(saySpy).toHaveBeenCalledOnce();
  });

  it('should not respond if chant has been reset', async ({ expect }) => {
    const [saySpy, fifo] = mockWires({
      enabled: true,
      interval: 10,
      length: 5,
    });

    const handler = new ChantHandler({});

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    simulateMessage(fifo, handler, createMessage('test', '4', 'not test'));

    for (let i = 5; i < 8; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    expect(saySpy).not.toBeCalled();
  });

  it('should count only unique users', async ({ expect }) => {
    const [saySpy, fifo] = mockWires({
      enabled: true,
      interval: 10,
      length: 4,
    });

    const handler = new ChantHandler({});

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    simulateMessage(fifo, handler, createMessage('test', '1', 'test'));
    simulateMessage(fifo, handler, createMessage('test', '1', 'test'));

    expect(saySpy).not.toBeCalled();
  });

  it('should not respond if the interval is not met', async ({ expect }) => {
    const [saySpy, fifo] = mockWires({
      enabled: true,
      interval: 10,
      length: 3,
    });

    const handler = new ChantHandler({});

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    expect(saySpy).toBeCalled();

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'another test'));
    }

    expect(saySpy).toHaveBeenCalledOnce();
  });

  it('should respond if the interval is met', async ({ expect }) => {
    vi.useFakeTimers();

    const [saySpy, fifo] = mockWires({
      enabled: true,
      interval: 10,
      length: 3,
    });

    const handler = new ChantHandler({});

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'test'));
    }

    expect(saySpy).toBeCalled();

    vi.setSystemTime(Date.now() + 12000);

    for (let i = 0; i < 3; i += 1) {
      simulateMessage(fifo, handler, createMessage('test', `${i}`, 'another test'));
    }

    expect(saySpy).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
