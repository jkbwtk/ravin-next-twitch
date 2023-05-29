import { Channel } from '#database/entities/Channel';
import { Token } from '#database/entities/Token';
import ExtendedSet from '#lib/ExtendedSet';
import { getChatters } from '#lib/twitch';


export interface ChannelThreadOptions {
  bufferLength?: number;
}

export class ChannelThread {
  private options: Required<ChannelThreadOptions>;

  public channel: Channel;
  public chatMembers: ExtendedSet<string> = new ExtendedSet();

  private messages: string[] = [];
  private lastMessageTimestamp = 0;
  private chantParticipants: Set<string> = new Set();
  private chantCounter = 0;
  public chantResponded = false;

  private intervals: ExtendedSet<NodeJS.Timeout> = new ExtendedSet();

  private static defaultOptions: Required<ChannelThreadOptions> = {
    bufferLength: 100,
  };

  constructor(channelUser: Channel, options: ChannelThreadOptions = {}) {
    this.options = { ...ChannelThread.defaultOptions, ...options };

    this.channel = channelUser;

    this.initIntervals();
  }

  public addMessage(message: string, author: string): void {
    this.lastMessageTimestamp = Date.now();

    const lastMessage = this.messages[this.messages.length - 1];

    if (lastMessage !== message) {
      this.resetChantLength();
    }

    if (!this.chantParticipants.has(author)) {
      this.chantCounter += 1;
      this.chantParticipants.add(author);
    }

    this.messages.push(message);

    if (this.messages.length > this.options.bufferLength) {
      this.messages.shift();
    }
  }

  public getTimeSinceLastMessage(): number {
    return Date.now() - this.lastMessageTimestamp;
  }

  public getChantLength(): number {
    return this.chantCounter;
  }

  public resetChantLength(): void {
    this.chantCounter = 0;
    this.chantParticipants.clear();
  }

  public updateConfig(options: ChannelThreadOptions): void {
    this.options = { ...this.options, ...options };
  }

  private async syncChatMembers(): Promise<void> {
    const token = await Token.getByUserIdOrFail(this.channel.user.id);

    const chatters = await getChatters(token, 1000);
    const mappedChatters = chatters.users.map((chatter) => chatter.user_id);

    this.chatMembers = new ExtendedSet(mappedChatters);
  }

  private async initIntervals(): Promise<void> {
    await this.syncChatMembers();

    this.intervals.add(setTimeout(() => {
      this.syncChatMembers();
    }, 1000 * 60 * 5));
  }

  public destroy(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
  }
}
