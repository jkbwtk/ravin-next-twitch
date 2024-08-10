import { BanUserstate, ChatUserstate, Client, DeleteUserstate, TimeoutUserstate } from 'tmi.js';
import { ChannelThread } from './ChannelThread';
import { ExtendedMap } from '../lib/ExtendedMap';
import { Config } from '#lib/Config';
import { isDevApi } from '#shared/constants';
import Deferred from '#shared/Deferred';
import { TwitchUserRepo } from '#lib/TwitchUserRepo';
import { logger } from '#lib/logger';
import { Wirable } from '#lib/autowire';
import { ExtendedCron } from '#lib/ExtendedCron';
import { BotActionType } from '#types/api/botActions';
import { CommandController } from '#database/controllers/CommandController';
import { BotActionController } from '#database/controllers/BotActionController';
import { ChannelController } from '#database/controllers/ChannelController';
import { PhraseFilterController } from '#database/controllers/PhraseFilterController';
import { RegexFilterController } from '#database/controllers/RegexFilterController';
import { CommandTimerController } from '#database/controllers/CommandTImerController';
import { ChannelActionController } from '#database/controllers/ChannelActionController';
import { ChannelStatsController } from '#database/controllers/ChannelStatsController';
import { MessageController } from '#database/controllers/MessageController';
import { PhraseFilter, RegexFilter } from '#types/database/tables';


export interface BotOptions {
  joinInterval: number;
  debug: boolean;
}

export class Bot {
  private static instance: Bot;

  private options: Required<BotOptions>;
  @Wirable() private client!: Client;

  private channels: ExtendedMap<string, ChannelThread>;

  private readonly rejoinChannelsJobName = 'Bot:rejoinChannels';

  private jobs: ExtendedMap<string, ExtendedCron> = new ExtendedMap();

  private static defaultOptions: Required<BotOptions> = {
    joinInterval: 1000,
    debug: true,
  };

  private async init(): Promise<void> {
    this.client = await this.createClient();
    this.registerEventHandlers();

    await this.client.connect();

    this.createJobs();
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

  private createJobs(): void {
    this.jobs.set(
      this.rejoinChannelsJobName,
      new ExtendedCron('?/1 * * * *', {
        name: this.rejoinChannelsJobName,
      }, this.rejoinChannels),
    );
  }

  private rejoinChannels = async () => {
    const channels = await ChannelController.getAllWithRelations();

    for (const channel of channels) {
      if (channel.joined && !this.client.getChannels().includes(`#${channel.user.login}`)) {
        await Bot.joinChannel(channel.userId);
      }
    }
  };

  private handleMessage = async (channel: string, userstate: ChatUserstate, message: string, self: boolean) => {
    try {
      if (self) return;

      const converted = MessageController.$utils.convertFromChatMessage(channel, userstate, message);
      const instance = await MessageController.create(converted);

      if (instance === null) {
        logger.warn('Failed to create message instance', { label: ['Bot', 'handleMessage'] });
        return;
      }

      const thread = this.channels.get(converted.channelUserId);

      if (!thread) {
        logger.warn('Channel thread for [%s] not found', channel, { label: ['Bot', 'handleMessage'] });
        return;
      }

      await ChannelStatsController.incrementMessages(instance.channelUserId);

      await thread.handleMessage(self, instance);
    } catch (err) {
      logger.error('Failed to handle message', { label: ['Bot', 'handleMessage'], error: err });
    }
  };

  private handleTimeout = async (channel: string, username: string, reason: string, duration: number, userstate: TimeoutUserstate) => {
    logger.debug('<%s> [%s] has been timed out for [%d] seconds: [%s]', channel, username, duration, reason, {
      label: ['Bot', 'handleTimeout'],
    });

    const thread = this.channels.get(userstate['room-id']!);
    if (!thread) {
      logger.warn('Channel thread for [%s] not found', channel, { label: ['Bot', 'handleTimeout'] });
      return;
    }

    await ChannelStatsController.incrementTimeouts(thread.channel.user.id);

    await ChannelActionController.create({
      channelUserId: thread.channel.user.id,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(thread.channel.user.id, username))?.display_name ?? username,
      data: (duration ?? 0).toString(),
      type: 'timeout',
    });
  };

  private handleBan = async (channel: string, username: string, reason: string, userstate: BanUserstate) => {
    logger.debug('<%s> [%s] has been banned: [%s]', channel, username, reason, { label: ['Bot', 'handleBan'] });

    const thread = this.channels.get(userstate['room-id']!);
    if (!thread) {
      logger.warn('Channel thread for [%s] not found', channel, { label: ['Bot', 'handleBan'] });
      return;
    }

    await ChannelStatsController.incrementBans(thread.channel.user.id);

    ChannelActionController.create({
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

    // @ts-expect-error error in tmi types
    const thread = this.channels.get(userstate['room-id']);
    if (!thread) {
      logger.warn('Channel thread for [%s] not found', channel, { label: ['Bot', 'handleDelete'] });
      return;
    }

    await ChannelStatsController.incrementDeleted(thread.channel.user.id);

    ChannelActionController.create({
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

    const channels = await ChannelController.getAllWithRelations();

    for (const channel of channels) {
      if (!channel.joined) continue;

      await Bot.joinChannel(channel.userId);
    }
  }

  public static async joinChannel(channelUserId: string): Promise<boolean> {
    try {
      const instance = await Bot.getInstance();
      const channel = await ChannelController.getByUserId(channelUserId);

      if (channel === null) {
        throw new Error(`Channel [${channelUserId}] not found`);
      }

      if (instance.client.getChannels().includes(`#${channel.user.login}`)) {
        if (instance.channels.has(channel.userId)) return true;
        else {
          logger.debug('Channel [%s] already joined, but not in channels map', channel.user.login, { label: ['Bot', 'joinChannel'] });
        }
      }

      const channelThread = new ChannelThread(instance, channel, {});
      await channelThread.init();
      instance.channels.set(channelUserId, channelThread);

      logger.debug('Joining channel [%s]', channel.user.login, { label: ['Bot', 'joinChannel'] });
      await Bot.waitForConnection();
      await instance.client.join(channel.user.login);
      await BotActionController.createFromType(channelUserId, BotActionType.ChannelJoined, channel.user.displayName);
      logger.debug('Joined channel [%s]', channel.user.login, { label: ['Bot', 'joinChannel'] });

      return true;
    } catch (err) {
      logger.error('Failed to join channel [%s]', channelUserId, { label: ['Bot', 'joinChannel'], error: err });
      return false;
    }
  }

  public static async leaveChannel(channelUserId: string): Promise<boolean> {
    try {
      const instance = await Bot.getInstance();
      const channel = await ChannelController.getByUserId(channelUserId);

      if (channel === null) {
        throw new Error(`Channel [${channelUserId}] not found`);
      }

      if (!instance.client.getChannels().includes(`#${channel.user.login}`)) {
        if (!instance.channels.has(channelUserId)) return true;
        else {
          logger.debug('Channel [%s] already left, but still in channels map', channel.user.login, { label: ['Bot', 'leaveChannel'] });
        }
      }

      logger.debug('Leaving channel [%s]', channel.user.login, { label: ['Bot', 'leaveChannel'] });
      instance.channels.get(channelUserId)?.destroy();
      instance.channels.delete(channelUserId);
      await instance.client.part(channel.user.login);
      await BotActionController.createFromType(channelUserId, BotActionType.ChannelLeft, channel.user.displayName);
      logger.debug('Left channel [%s]', channel.user.login, { label: ['Bot', 'leaveChannel'] });

      return true;
    } catch (err) {
      logger.error('Failed to leave channel [%s]', channelUserId, { label: ['Bot', 'leaveChannel'], error: err });
      return false;
    }
  }

  public static getChannelThread(channelUserId: string): ChannelThread | undefined {
    const instance = Bot.instance;
    if (!instance) return undefined;

    return instance.channels.get(channelUserId);
  }

  public async destroy(): Promise<void> {
    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();

    this.channels.forEach((channel) => channel.destroy());
    this.channels.clear();

    await this.client.disconnect();
    this.client.removeAllListeners();
  }
}
