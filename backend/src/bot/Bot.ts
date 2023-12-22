import { BanUserstate, ChatUserstate, Client, DeleteUserstate, TimeoutUserstate } from 'tmi.js';
import { ChannelThread } from './ChannelThread';
import { ExtendedMap } from '../lib/ExtendedMap';
import { Config } from '#lib/Config';
import { isDevApi } from '#shared/constants';
import Deferred from '#lib/Deferred';
import { TwitchUserRepo } from '#lib/TwitchUserRepo';
import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { Wirable } from '#lib/autowire';
import { SocketServer } from '#server/SocketServer';


export interface BotOptions {
  joinInterval: number;
  debug: boolean;
}

export class Bot {
  private static instance: Bot;

  private options: Required<BotOptions>;
  @Wirable() private client!: Client;

  private channels: ExtendedMap<string, ChannelThread>;

  private static defaultOptions: Required<BotOptions> = {
    joinInterval: 1000,
    debug: true,
  };

  private async init(): Promise<void> {
    this.client = await this.createClient();
    this.registerEventHandlers();

    await this.client.connect();
  }

  public static async getInstance(options?: Partial<BotOptions>): Promise<Bot> {
    if (!Bot.instance) {
      Bot.instance = new Bot(options);
      await Bot.instance.init();
    }

    return Bot.instance;
  }

  constructor(options?: Partial<BotOptions>) {
    this.options = { ...Bot.defaultOptions, ...options ?? {} };

    this.channels = new ExtendedMap();
  }

  private async createClient(): Promise<Client> {
    return new Client({
      channels: [],
      identity: {
        username: await Config.getOrFail('botLogin'),
        password: await Config.getOrFail('botToken'),
      },
      connection: {
        secure: true,
        reconnect: true,
      },
      options: {
        joinInterval: this.options.joinInterval, // Twitch rate limit -> 300 ms
        debug: this.options.debug,
      },
      logger: {
        info: (msg) => logger.info(msg, { label: ['Bot', 'Client'] }),
        warn: (msg) => logger.warn(msg, { label: ['Bot', 'Client'] }),
        error: (msg) => logger.error(msg, { label: ['Bot', 'Client'] }),
      },
    });
  }

  private registerEventHandlers(): void {
    this.client.on('message', this.handleMessage);
    this.client.on('timeout', this.handleTimeout);
    this.client.on('ban', this.handleBan);
    this.client.on('messagedeleted', this.handleDelete);
  }

  private static handleLogon = async (deferred: Deferred<void>) => {
    logger.debug('Logon event fired', { label: ['Bot', 'handleLogon'] });
    deferred.resolve();
  };

  private static handleDisconnect = async (reason: string) => {
    logger.debug('Disconnect event fired', { label: ['Bot', 'handleDisconnect'] });
    logger.debug('Reason: %s', reason, { label: ['Bot', 'handleDisconnect'] });
  };

  private static waitForConnection = async () => {
    const instance = await Bot.getInstance();
    if (instance.client.readyState() === 'OPEN') return;

    const deferred = new Deferred<void>();
    const wrapper = () => this.handleLogon(deferred);

    instance.client.addListener('connected', wrapper);
    await deferred.promise;
    instance.client.removeListener('connected', wrapper);
  };

  private handleMessage = async (channel: string, userstate: ChatUserstate, message: string, self: boolean) => {
    try {
      if (self) return;

      const instance = await prisma.message.createFromChatUserState(channel, userstate, message);
      const thread = this.channels.get(channel.slice(1));

      if (!thread) {
        logger.warn('Channel thread for [%s] not found', channel, { label: ['Bot', 'handleMessage'] });
        return;
      }

      await prisma.channelStats.incrementMessages(instance.channelUserId);
      SocketServer.emitToUser(instance.channelUserId, 'NEW_MESSAGE', instance.serialize());

      await thread.handleMessage(self, instance);
    } catch (err) {
      logger.error('Failed to handle message', { label: ['Bot', 'handleMessage'], error: err });
    }
  };

  private handleTimeout = async (channel: string, username: string, reason: string, duration: number, userstate: TimeoutUserstate) => {
    logger.debug('<%s> [%s] has been timed out for [%d] seconds: [%s]', channel, username, duration, reason, {
      label: ['Bot', 'handleTimeout'],
    });

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      logger.warn('Channel thread for [%s] not found', channel, { label: ['Bot', 'handleTimeout'] });
      return;
    }

    await prisma.channelStats.incrementTimeouts(thread.channel.user.id);

    prisma.channelAction.createAndEmit({
      channelUserId: thread.channel.user.id,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(thread.channel.user.id, username))?.display_name ?? username,
      data: (duration ?? 0).toString(),
      type: 'timeout',
    });
  };

  private handleBan = async (channel: string, username: string, reason: string, userstate: BanUserstate) => {
    logger.debug('<%s> [%s] has been banned: [%s]', channel, username, reason, { label: ['Bot', 'handleBan'] });

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      logger.warn('Channel thread for [%s] not found', channel, { label: ['Bot', 'handleBan'] });
      return;
    }

    await prisma.channelStats.incrementBans(thread.channel.user.id);

    await prisma.channelAction.createAndEmit({
      channelUserId: thread.channel.user.id,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(thread.channel.user.id, username))?.display_name ?? username,
      type: 'ban',
      data: reason ?? '[No reason given]',
    });
  };

  private handleDelete = async (channel: string, username: string, deletedMessage: string, userstate: DeleteUserstate) => {
    logger.debug('<%s> [%s]\'s message has been deleted: [%s]', channel, username, deletedMessage, {
      label: ['Bot', 'handleDelete'],
    });

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      logger.warn('Channel thread for [%s] not found', channel, { label: ['Bot', 'handleDelete'] });
      return;
    }

    await prisma.channelStats.incrementDeleted(thread.channel.user.id);

    await prisma.channelAction.createAndEmit({
      channelUserId: thread.channel.user.id,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(thread.channel.user.id, username))?.display_name ?? 'Chat Member',
      type: 'delete',
      data: deletedMessage,
    });
  };

  public static async start(options?: Partial<BotOptions>): Promise<void> {
    const instance = await Bot.getInstance(options);

    await instance.joinChannels();
  }

  public static async updateConfig(options: Partial<BotOptions>): Promise<void> {
    const instance = await Bot.getInstance();

    instance.options = { ...instance.options, ...options };

    for (const channel of instance.channels.values()) {
      channel.updateConfig({});
    }
  }

  private async joinChannels(): Promise<void> {
    if (isDevApi) {
      logger.debug('Skipping joining channels because dev mode is enabled', { label: ['Bot', 'joinChannels'] });
      return;
    }

    const channels = await prisma.channel.findMany({
      include: {
        user: true,
      },
    });

    for (const channel of channels) {
      if (!channel.joined) continue;

      await Bot.joinChannel(channel.userId);
    }
  }

  public static async joinChannel(id: string): Promise<boolean> {
    try {
      const instance = await Bot.getInstance();
      const channel = await prisma.channel.getByUserIdOrFail(id);

      if (instance.client.getChannels().includes(`#${channel.user.login}`)) {
        if (instance.channels.has(channel.user.login)) return true;
        else {
          logger.debug('Channel [%s] already joined, but not in channels map', channel.user.login, { label: ['Bot', 'joinChannel'] });
        }
      }

      const channelThread = new ChannelThread(instance, channel, {});
      await channelThread.init();
      instance.channels.set(channel.user.login, channelThread);

      logger.debug('Joining channel [%s]', channel.user.login, { label: ['Bot', 'joinChannel'] });
      await Bot.waitForConnection();
      await instance.client.join(channel.user.login);
      logger.debug('Joined channel [%s]', channel.user.login, { label: ['Bot', 'joinChannel'] });

      return true;
    } catch (err) {
      logger.error('Failed to join channel [%s]', id, { label: ['Bot', 'joinChannel'], err });
      return false;
    }
  }

  public static async leaveChannel(id: string): Promise<boolean> {
    try {
      const instance = await Bot.getInstance();
      const channel = await prisma.channel.getByUserIdOrFail(id);

      if (!instance.client.getChannels().includes(`#${channel.user.login}`)) {
        if (!instance.channels.has(channel.user.login)) return true;
        else {
          logger.debug('Channel [%s] already left, but still in channels map', channel.user.login, { label: ['Bot', 'leaveChannel'] });
        }
      }

      logger.debug('Leaving channel [%s]', channel.user.login, { label: ['Bot', 'leaveChannel'] });
      instance.channels.get(channel.user.login)?.destroy();
      instance.channels.delete(channel.user.login);
      await instance.client.part(channel.user.login);
      logger.debug('Left channel [%s]', channel.user.login, { label: ['Bot', 'leaveChannel'] });

      return true;
    } catch (err) {
      logger.warn('Failed to leave channel [%s]', id, { label: ['Bot', 'leaveChannel'], err });
      return false;
    }
  }

  public static getChannelThread(username: string): ChannelThread | undefined {
    const instance = Bot.instance;
    if (!instance) return undefined;

    return instance.channels.get(username);
  }

  public static async reloadChannelCommands(channelId: string): Promise<void> {
    const channel = await prisma.channel.getByUserIdOrFail(channelId);
    const channelThread = Bot.getChannelThread(channel.user.login);

    if (!channelThread) {
      logger.warn('Channel thread for [%s] not found', channel.user.login, { label: ['Bot', 'reloadChannelCommands'] });
      return;
    }

    await channelThread.commandHandler.syncCustomCommands();
  }

  public static async reloadChannelChannel(channelId: string): Promise<void> {
    const channel = await prisma.channel.getByUserIdOrFail(channelId);
    const channelThread = Bot.getChannelThread(channel.user.login);

    if (!channelThread) {
      logger.warn('Channel thread for [%s] not found', channel.user.login, { label: ['Bot', 'reloadChannelChannel'] });
      return;
    }

    await channelThread.syncChannel();
  }

  public static async reloadChannelCommandTimers(channelId: string): Promise<void> {
    const channel = await prisma.channel.getByUserIdOrFail(channelId);
    const channelThread = Bot.getChannelThread(channel.user.login);

    if (!channelThread) {
      logger.warn('Channel thread for [%s] not found', channel.user.login, { label: ['Bot', 'reloadChannelCommandTimers'] });
      return;
    }

    await channelThread.commandTimerHandler.syncCommandTimers();
  }
}
