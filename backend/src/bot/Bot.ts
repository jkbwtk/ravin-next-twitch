import { BanUserstate, ChatUserstate, Client, DeleteUserstate, TimeoutUserstate } from 'tmi.js';
import { ChannelThread } from './ChannelThread';
import { display, LOGLVL } from '../lib/display';
import { ExtendedMap } from '../lib/ExtendedMap';
import { Config } from '#lib/Config';
import { Database } from '#database/Database';
import { Channel } from '#database/entities/Channel';
import { isDevApi } from '#shared/constants';
import { ChannelStats } from '#database/entities/ChannelStats';
import Deferred from '#lib/Deferred';
import { TwitchUserRepo } from '#lib/TwitchUserRepo';
import { SocketServer } from '#server/SocketServer';
import { Database as Prisma } from '#database/Prisma';


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
    display.debug.nextLine('Bot:handleDisconnect', 'Disconnect event fired');
    display.debug.nextLine('Bot:handleDisconnect', 'Reason:', reason);
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

      const instance = await Prisma.getPrismaClient().message.createFromChatUserState(channel, userstate, message);
      const thread = this.channels.get(channel.slice(1));

      if (!thread) {
        display.warning.nextLine('Bot:handleMessage', `Channel thread for [${channel}] not found`);
        return;
      }

      await ChannelStats.incrementMessages(instance.channelUserId);
      const getTimeSinceLastMessage = thread.getTimeSinceLastMessage();

      display.debug.nextLine('Bot:handleMessage', 'Time since last message:', getTimeSinceLastMessage);
      thread.addMessage(message, userstate.username ?? 'Anonymous');
      display.debug.nextLine('Bot:handleMessage', 'Chant length:', thread.getChantLength());

      const customCommand = thread.getUsedCustomCommand(message);

      if (customCommand) {
        if (
          customCommand.command.enabled &&
          Date.now() - customCommand.lastUsed >= customCommand.command.cooldown * 1000 &&
          instance.getUserLevel() >= customCommand.command.userLevel
        ) {
          await this.client.say(channel, customCommand.command.response);
          await ChannelStats.incrementCommands(thread.channel.user.id);
          await Prisma.getPrismaClient().command.incrementUsage(customCommand.command.id);

          customCommand.lastUsed = Date.now();
          customCommand.lastUsedBy = userstate['display-name'] ?? 'Chat Member';

          SocketServer.emitToUser(thread.channel.user.id, 'COMMAND_EXECUTED', {
            command: customCommand.command.serialize(),
            lastUsed: customCommand.lastUsed,
            lastUsedBy: customCommand.lastUsedBy,
          });

          return;
        }
      }

      if (
        thread.channel.chantingSettings.enabled &&
        getTimeSinceLastMessage >= thread.channel.chantingSettings.interval &&
        thread.getChantLength() >= thread.channel.chantingSettings.length
      ) {
        thread.chantResponded = true;
        await this.client.say(channel, message);
      }
    } catch (err) {
      display.error.nextLine('Bot:handleMessage', `Failed to handle message`, err);
    }
  };

  private handleTimeout = async (channel: string, username: string, reason: string, duration: number, userstate: TimeoutUserstate) => {
    display.log(LOGLVL.SPAM, `<${channel}> ${username} has been timed out for ${duration} seconds: ${reason}`);

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      display.warning.nextLine(`Bot:handleTimeout`, `Channel thread for [${channel}] not found`);
      return;
    }

    await ChannelStats.incrementTimeouts(thread.channel.user.id);

    Prisma.getPrismaClient().channelAction.createAndEmit({
      channelUserId: thread.channel.user.id,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(thread.channel.user.id, username))?.display_name ?? username,
      data: (duration ?? 0).toString(),
      type: 'timeout',
    });
  };

  private handleBan = async (channel: string, username: string, reason: string, userstate: BanUserstate) => {
    display.log(LOGLVL.SPAM, `<${channel}> ${username} has been banned: ${reason}`);

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      display.warning.nextLine(`Bot:handleBan`, `Channel thread for [${channel}] not found`);
      return;
    }

    await ChannelStats.incrementBans(thread.channel.user.id);

    await Prisma.getPrismaClient().channelAction.createAndEmit({
      channelUserId: thread.channel.user.id,
      issuerDisplayName: thread.channel.user.displayName,
      targetDisplayName: (await TwitchUserRepo.getByLogin(thread.channel.user.id, username))?.display_name ?? username,
      type: 'ban',
      data: reason ?? '[No reason given]',
    });
  };

  private handleDelete = async (channel: string, username: string, deletedMessage: string, userstate: DeleteUserstate) => {
    display.log(LOGLVL.SPAM, `<${channel}> ${username}'s message has been deleted: ${deletedMessage}`);

    const thread = this.channels.get(channel.slice(1));
    if (!thread) {
      display.warning.nextLine(`Bot:handleDelete`, `Channel thread for [${channel}] not found`);
      return;
    }

    await ChannelStats.incrementDeleted(thread.channel.user.id);

    await Prisma.getPrismaClient().channelAction.createAndEmit({
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
      const channel = await Prisma.getPrismaClient().channel.getByUserIdOrFail(id);

      if (instance.client.getChannels().includes(`#${channel.user.login}`)) {
        if (instance.channels.has(channel.user.login)) return true;
        else {
          display.debug.nextLine('Bot:joinChannel', `Channel [${channel.user.login}] already joined, but not in channels map`);
        }
      }

      const channelThread = new ChannelThread(channel, {});
      await channelThread.init();
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
      const channel = await Prisma.getPrismaClient().channel.getByUserIdOrFail(id);

      if (!instance.client.getChannels().includes(`#${channel.user.login}`)) {
        if (!instance.channels.has(channel.user.login)) return true;
        else {
          display.debug.nextLine('Bot:leaveChannel', `Channel [${channel.user.login}] already left, but still in channels map`);
        }
      }

      display.debug.nextLine('Bot:leaveChannel', `Leaving channel [${channel.user.login}]`);
      instance.channels.get(channel.user.login)?.destroy();
      instance.channels.delete(channel.user.login);
      await instance.client.part(channel.user.login);
      display.debug.nextLine('Bot:leaveChannel', `Left channel [${channel.user.login}]`);

      return true;
    } catch (err) {
      display.warning.nextLine('Bot:leaveChannel', `Failed to leave channel [${id}]`, err);
      return false;
    }
  }

  public static getChannelThread(username: string): ChannelThread | undefined {
    const instance = Bot.instance;
    if (!instance) return undefined;

    return instance.channels.get(username);
  }

  public static async reloadChannelCommands(channelId: string): Promise<void> {
    const channel = await Prisma.getPrismaClient().channel.getByUserIdOrFail(channelId);
    const channelThread = Bot.getChannelThread(channel.user.login);

    if (!channelThread) {
      display.warning.nextLine('Bot:reloadChannelCommands', `Channel thread for [${channel.user.login}] not found`);
      return;
    }

    await channelThread.syncCustomCommands();
  }

  public static async reloadChannelChannel(channelId: string): Promise<void> {
    const channel = await Prisma.getPrismaClient().channel.getByUserIdOrFail(channelId);
    const channelThread = Bot.getChannelThread(channel.user.login);

    if (!channelThread) {
      display.warning.nextLine('Bot:reloadChannelChannel', `Channel thread for [${channel.user.login}] not found`);
      return;
    }

    await channelThread.syncChannel();
  }
}
