import { Channel } from '#database/entities/Channel';
import { ExtendedMap } from '#lib/ExtendedMap';
import ExtendedSet from '#lib/ExtendedSet';
import { getChatters } from '#lib/twitch';
import { Command } from '#database/entities/Command';


export type CustomCommandState = {
  lastUsed: number;
  lastUsedBy?: string;
  command: Command;
};

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
  public customCommands: ExtendedMap<string, CustomCommandState> = new ExtendedMap();

  private static defaultOptions: Required<ChannelThreadOptions> = {
    bufferLength: 100,
  };

  constructor(channelUser: Channel, options: ChannelThreadOptions = {}) {
    this.options = { ...ChannelThread.defaultOptions, ...options };

    this.channel = channelUser;
  }

  public async init(): Promise<void> {
    await this.startChatMemberSyncing();
    await this.syncCustomCommands();
  }

  public destroy(): void {
    this.stopChatMemberSyncing();
  }

  public addMessage(message: string, author: string): void {
    this.processChant(message, author);
  }

  private processChant(message: string, author: string): void {
    this.lastMessageTimestamp = Date.now();

    const lastMessage = this.messages.at(-1);

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
    const chatters = await getChatters(this.channel.user.id, 1000);
    const mappedChatters = chatters.users.map((chatter) => chatter.user_id);

    this.chatMembers = new ExtendedSet(mappedChatters);
  }

  private async startChatMemberSyncing(): Promise<void> {
    await this.syncChatMembers();

    this.intervals.add(setTimeout(() => {
      this.syncChatMembers();
    }, 1000 * 60 * 5));
  }

  private stopChatMemberSyncing(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
  }

  public async syncCustomCommands(): Promise<void> {
    const commands = await Command.getByChannelId(this.channel.user.id);

    this.customCommands.clear();
    for (const command of commands) {
      this.customCommands.set(command.command, {
        lastUsed: 0,
        command,
      });
    }
  }

  public getUsedCustomCommand(message: string): CustomCommandState | null {
    const [commandName] = message.trim().split(' ');

    if (!commandName) return null;
    return this.customCommands.get(commandName) ?? null;
  }

  public async syncChannel(): Promise<void> {
    this.channel = await Channel.getByUserIdOrFail(this.channel.user.id);
  }
}
