import { ExtendedMap } from '#lib/ExtendedMap';
import ExtendedSet from '#lib/ExtendedSet';
import { getChatters } from '#lib/twitch';
import { ChannelWithUser } from '#database/extensions/channel';
import { prisma } from '#database/database';
import { CommandWithUser } from '#database/extensions/command';
import { ExtendedCron } from '#lib/ExtendedCron';
import { Client } from 'tmi.js';
import { ChantHandler } from '#bot/ChantHandler';
import { Message } from '@prisma/client';
import { mergeOptions, RequiredDefaults } from '#shared/utils';
import { CacheFIFO } from '#lib/CacheArray';


export type CustomCommandState = {
  lastUsed: number;
  lastUsedBy?: string;
  command: CommandWithUser;
};

export type ChannelThreadOptions = {
  messageCacheSize?: number;
};

export class ChannelThread {
  private options: Required<ChannelThreadOptions>;

  public chatMembers: ExtendedSet<string> = new ExtendedSet();

  public chantHandler: ChantHandler;

  public messages: CacheFIFO<string>;
  public readonly refreshChatMembersJobName: string;
  private jobs: ExtendedMap<string, ExtendedCron> = new ExtendedMap();
  public customCommands: ExtendedMap<string, CustomCommandState> = new ExtendedMap();

  private static defaultOptions: RequiredDefaults<ChannelThreadOptions> = {
    messageCacheSize: 100,
  };

  constructor(public client: Client, public channel: ChannelWithUser, options: ChannelThreadOptions = {}) {
    this.options = mergeOptions(options, ChannelThread.defaultOptions);

    this.chantHandler = new ChantHandler(this);

    this.messages = new CacheFIFO(this.options.messageCacheSize);

    this.refreshChatMembersJobName = `ChannelThread:${this.channel.user.login}:refreshChatMembers`;
  }

  public async init(): Promise<void> {
    await this.startChatMemberSyncing();
    await this.syncCustomCommands();
  }

  public destroy(): void {
    this.stopChatMemberSyncing();

    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();
  }

  public async handleMessage(message: Message): Promise<void> {
    await this.chantHandler.handleMessage(message);

    this.messages.push(message.content);
  }

  public updateConfig(options: ChannelThreadOptions): void {
    this.options = { ...this.options, ...options };

    this.messages.setMaxLength(this.options.messageCacheSize);
  }

  private async syncChatMembers(): Promise<void> {
    const chatters = await getChatters(this.channel.user.id, 1000);
    const mappedChatters = chatters.users.map((chatter) => chatter.user_id);

    this.chatMembers = new ExtendedSet(mappedChatters);
  }

  private async startChatMemberSyncing(): Promise<void> {
    const job = new ExtendedCron('0 */5 * * * *', {
      name: this.refreshChatMembersJobName,
    }, async () => {
      await this.syncChatMembers();
    });

    await job.trigger();

    this.jobs.set(this.refreshChatMembersJobName, job);
  }

  private stopChatMemberSyncing(): void {
    this.jobs.get(this.refreshChatMembersJobName)?.stop();
    this.jobs.delete(this.refreshChatMembersJobName);
  }

  public async syncCustomCommands(): Promise<void> {
    const commands = await prisma.command.getByChannelId(this.channel.user.id);

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
    this.channel = await prisma.channel.getByUserIdOrFail(this.channel.userId);
  }
}
