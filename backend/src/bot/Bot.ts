import { ChatUserstate, Client } from 'tmi.js';
import { ChannelThread } from './ChannelThread';
import { display } from '../lib/display';
import { ExtendedMap } from '../lib/ExtendedMap';
import { Markov } from './Markov';
import { arrayFrom } from '../lib/utils';


export interface BotOptions {
  login: string;
  token: string;
  channels: string | string[],
  joinInterval?: number;
  debug?: boolean;
  trainingDataPath?: string;
  ignoredUsers?: string[];
}

export class Bot {
  private options: Required<BotOptions>;
  private client: Client;
  public markov: Markov;

  private channels: ExtendedMap<string, ChannelThread>;

  private static defaultOptions: Required<BotOptions> = {
    login: 'LOGIN',
    token: 'TOKEN',
    channels: [],
    joinInterval: 1000,
    debug: false,
    trainingDataPath: './training-data.csv',
    ignoredUsers: [],
  };

  constructor(options: BotOptions) {
    this.options = { ...Bot.defaultOptions, ...options };

    this.client = this.createClient();
    this.markov = new Markov(this.options.trainingDataPath, { ignoredUsers: this.options.ignoredUsers });

    this.channels = this.createChannelThreads();

    this.registerEventHandlers();
  }

  private createClient(): Client {
    return new Client({
      channels: arrayFrom(this.options.channels),
      identity: {
        username: this.options.login,
        password: this.options.token,
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

  private createChannelThreads(): ExtendedMap<string, ChannelThread> {
    const channels = new ExtendedMap<string, ChannelThread>();

    for (const channel of this.options.channels) {
      channels.set(channel, new ChannelThread());
    }

    return channels;
  }

  private registerEventHandlers(): void {
    this.client.on('message', this.handleMessage);
  }

  private handleMessage = (channel: string, userstate: ChatUserstate, message: string, self: boolean) => {
    if (self) return;
    console.log(`<${channel}> ${userstate['display-name']}: ${message}`);
    this.markov.save({
      username: userstate.username ?? 'Anonymous',
      flags: userstate.flags ?? 'NULL',
      emotes: typeof userstate.emotes === 'object' && userstate.emotes !== null ? JSON.stringify(userstate.emotes) : 'NULL',
      channel,
      content: message,
    });

    const channelThread = this.channels.get(channel.slice(1));
    if (!channelThread) {
      display.warning.nextLine(`Bot:handleMessage`, `Channel thread for [${channel}] not found`);
      return;
    }

    display.debug.nextLine(channel, 'Time since last message:', channelThread.getTimeSinceLastMessage());
    channelThread.addMessage(message, userstate.username ?? 'Anonymous');
    display.debug.nextLine(channel, 'Chant length:', channelThread.getChantLength());

    if (message.startsWith('!generate')) {
      try {
        const prompt = message.replace('!generate', '').trim();
        const words = prompt.split(' ');

        const seed = (words[0] ?? '').length > 0 ? words[0] : undefined;
        const generated = this.markov.generate(seed);

        this.client.say(channel, generated);
      } catch (error) {
        display.error.nextLine('Bot:handleMessage', error);
        this.client.say(channel, 'MrDestructoid');
      }
    }
  };

  public async init(): Promise<void> {
    await this.client.connect();
  }

  public updateConfig(options: BotOptions): void {
    this.options = { ...this.options, ...options };
    this.markov.updateConfig({ ignoredUsers: this.options.ignoredUsers });

    for (const channel of this.channels.values()) {
      channel.updateConfig({});
    }
  }
}
