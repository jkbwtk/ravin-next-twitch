import { ChatUserstate, Client } from 'tmi.js';
import { ChannelThread } from './ChannelThread';
import { display } from '../lib/display';
import { ExtendedMap } from '../lib/ExtendedMap';
import { Markov } from './Markov';
import { arrayFrom } from '../lib/utils';
import { Config } from '#lib/Config';
import { Database } from '#database/Database';
import { Channel } from '#database/entities/Channel';
import { isDevMode } from '#shared/constants';


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
    debug: false,
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
        info: (msg) => null,
        warn: (msg) => console.log(msg),
        error: (msg) => null,
      },
    });
  }

  private registerEventHandlers(): void {
    this.client.on('message', this.handleMessage);
  }

  private handleMessage = (channel: string, userstate: ChatUserstate, message: string, self: boolean) => {
    if (self) return;
    console.log(`<${channel}> ${userstate['display-name']}: ${message}`);

    const channelThread = this.channels.get(channel.slice(1));
    if (!channelThread) {
      display.warning.nextLine(`Bot:handleMessage`, `Channel thread for [${channel}] not found`);
      return;
    }

    display.debug.nextLine(channel, 'Time since last message:', channelThread.getTimeSinceLastMessage());
    channelThread.addMessage(message, userstate.username ?? 'Anonymous');
    display.debug.nextLine(channel, 'Chant length:', channelThread.getChantLength());
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
    if (isDevMode) {
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

      await Bot.joinChannel(channel.user.login);
    }
  }

  public static async joinChannel(channel: string): Promise<void> {
    const instance = await Bot.getInstance();

    if (instance.channels.has(channel)) return;

    const channelThread = new ChannelThread({});
    instance.channels.set(channel, channelThread);

    display.debug.nextLine('Bot:joinChannel', `Joining channel [${channel}]`);
    await instance.client.join(channel);
    display.debug.nextLine('Bot:joinChannel', `Joined channel [${channel}]`);
  }

  public static async leaveChannel(channel: string): Promise<void> {
    const instance = await Bot.getInstance();

    if (!instance.channels.has(channel)) return;

    display.debug.nextLine('Bot:leaveChannel', `Leaving channel [${channel}]`);
    instance.channels.delete(channel);
    await instance.client.part(channel);
    display.debug.nextLine('Bot:leaveChannel', `Left channel [${channel}]`);
  }
}
