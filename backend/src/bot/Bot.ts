import { BanUserstate, ChatUserstate, Client, DeleteUserstate, TimeoutUserstate } from 'tmi.js';
import { ChannelThread } from './ChannelThread';
import { display } from '../lib/display';
import { ExtendedMap } from '../lib/ExtendedMap';
import { Markov } from './Markov';
import { arrayFrom } from '../lib/utils';
import { Config } from '#lib/Config';
import { Database } from '#database/Database';
import { Channel } from '#database/entities/Channel';
import { isDevApi } from '#shared/constants';
import { Message } from '#database/entities/Message';
import { ChannelStats } from '#database/entities/ChannelStats';
import Deferred from '#lib/Deferred';
import { ChannelAction } from '#database/entities/ChannelAction';
import { TwitchUserRepo } from '#lib/TwitchUserRepo';
import { Token } from '#database/entities/Token';


export interface BotOptions {
  joinInterval: number;
  debug: boolean;
}

export class Bot {
  private static instance: Bot;

  private options: Required<BotOptions>;
  private client!: Client;

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
        info: (msg) => display.debug.nextLine('Bot:Client', msg),
        warn: (msg) => display.warning.nextLine('Bot:Client', msg),
        error: (msg) => display.error.nextLine('Bot:Client', msg),
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
    display.debug.nextLine('Bot:handleLogon', 'Logon event fired');
    deferred.resolve();
  };

  private static handleDisconnect = async (reason: string) => {
    console.log('Bot:handleDisconnect', 'Disconnect event fired');
    console.log('Bot:handleDisconnect', 'Reason:', reason);
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
    if (self) return;
    console.log(`<${channel}> ${userstate['display-name']}: ${message}`);

    const instance = Message.fromChatUserState(channel, userstate, message);
    const repository = await Database.getRepository(Message);
    await repository.save(instance);

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      display.warning.nextLine(`Bot:handleMessage`, `Channel thread for [${channel}] not found`);
      return;
    }

    await ChannelStats.incrementMessages(instance.channelUser.id);

    display.debug.nextLine(channel, 'Time since last message:', thread.getTimeSinceLastMessage());
    thread.addMessage(message, userstate.username ?? 'Anonymous');
    display.debug.nextLine(channel, 'Chant length:', thread.getChantLength());
  };

  private handleTimeout = async (channel: string, username: string, reason: string, duration: number, userstate: TimeoutUserstate) => {
    console.log(`<${channel}> ${username} has been timed out for ${duration} seconds: ${reason}`);
    console.log(channel, username, reason, duration, userstate);

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      display.warning.nextLine(`Bot:handleTimeout`, `Channel thread for [${channel}] not found`);
      return;
    }

    await ChannelStats.incrementTimeouts(thread.channel.user.id);

    const repository = await Database.getRepository(ChannelAction);
    const token = await Token.getByUserIdOrFail(thread.channel.user.id);

    const action = repository.create({
      channelUser: thread.channel.user,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(token, username))?.display_name ?? username,
      data: (duration ?? 0).toString(),
      type: 'timeout',
    });

    await repository.save(action);
  };

  private handleBan = async (channel: string, username: string, reason: string, userstate: BanUserstate) => {
    console.log(`<${channel}> ${username} has been banned: ${reason}`);
    console.log(channel, username, reason, userstate);

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      display.warning.nextLine(`Bot:handleBan`, `Channel thread for [${channel}] not found`);
      return;
    }

    await ChannelStats.incrementBans(thread.channel.user.id);

    const repository = await Database.getRepository(ChannelAction);
    const token = await Token.getByUserIdOrFail(thread.channel.user.id);

    const action = repository.create({
      channelUser: thread.channel.user,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(token, username))?.display_name ?? username,
      type: 'ban',
      data: reason ?? '[No reason given]',
    });

    await repository.save(action);
  };

  private handleDelete = async (channel: string, username: string, deletedMessage: string, userstate: DeleteUserstate) => {
    console.log(`<${channel}> ${username}'s message has been deleted: ${deletedMessage}`);
    console.log(channel, username, deletedMessage, userstate);

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      display.warning.nextLine(`Bot:handleDelete`, `Channel thread for [${channel}] not found`);
      return;
    }

    await ChannelStats.incrementDeleted(thread.channel.user.id);

    const repository = await Database.getRepository(ChannelAction);
    const token = await Token.getByUserIdOrFail(thread.channel.user.id);

    const action = repository.create({
      channelUser: thread.channel.user,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(token, username))?.display_name ?? 'Chat Member',
      type: 'delete',
      data: deletedMessage,
    });

    await repository.save(action);
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
      display.debug.nextLine('Bot:joinChannels', 'Skipping joining channels because dev mode is enabled');
      return;
    }

    const channelRepository = await Database.getRepository(Channel);
    const channels = await channelRepository.find({
      relations: {
        user: true,
      },
    });

    for (const channel of channels) {
      if (!channel.joined) continue;

      await Bot.joinChannel(channel.user.id);
    }
  }

  public static async joinChannel(id: string): Promise<boolean> {
    try {
      const instance = await Bot.getInstance();
      const channel = await Channel.getByUserIdOrFail(id);

      if (instance.client.getChannels().includes(`#${channel.user.login}`)) {
        if (instance.channels.has(channel.user.login)) return true;
        else {
          display.debug.nextLine('Bot:joinChannel', `Channel [${channel.user.login}] already joined, but not in channels map`);
        }
      }

      const channelThread = new ChannelThread(channel, {});
      instance.channels.set(channel.user.login, channelThread);

      display.debug.nextLine('Bot:joinChannel', `Joining channel [${channel.user.login}]`);
      await Bot.waitForConnection();
      await instance.client.join(channel.user.login);
      display.debug.nextLine('Bot:joinChannel', `Joined channel [${channel.user.login}]`);

      return true;
    } catch (err) {
      display.warning.nextLine('Bot:joinChannel', `Failed to join channel [${id}]`, err);
      return false;
    }
  }

  public static async leaveChannel(id: string): Promise<boolean> {
    try {
      const instance = await Bot.getInstance();
      const channel = await Channel.getByUserIdOrFail(id);

      if (!instance.client.getChannels().includes(`#${channel.user.login}`)) {
        if (!instance.channels.has(channel.user.login)) return true;
        else {
          display.debug.nextLine('Bot:leaveChannel', `Channel [${channel.user.login}] already left, but still in channels map`);
        }
      }

      display.debug.nextLine('Bot:leaveChannel', `Leaving channel [${channel.user.login}]`);
      instance.channels.delete(channel.user.login);
      await instance.client.part(channel.user.login);
      display.debug.nextLine('Bot:leaveChannel', `Left channel [${channel.user.login}]`);

      return true;
    } catch (err) {
      display.warning.nextLine('Bot:leaveChannel', `Failed to leave channel [${id}]`, err);
      return false;
    }
  }
}
