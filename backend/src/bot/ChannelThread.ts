import { ExtendedMap } from '#lib/ExtendedMap';
import ExtendedSet from '#lib/ExtendedSet';
import { getChatters } from '#lib/twitch';
import { ChannelWithUser } from '#database/extensions/channel';
import { prisma } from '#database/database';
import { ExtendedCron } from '#lib/ExtendedCron';
import { ChantHandler } from '#bot/ChantHandler';
import { mergeOptions, RequiredDefaults } from '#shared/utils';
import { CacheFIFO } from '#lib/CacheArray';
import { CommandHandler } from '#bot/CommandHandler';
import { MessageWithUser } from '#database/extensions/message';
import { AutoWirable, ClassInstance, Wirable } from '#lib/autowire';
import { CommandTimerHandler } from '#bot/CommandTimerHandler';
import { Isolate } from 'isolated-vm';


export type ChannelThreadOptions = {
  messageCacheSize?: number;
};

export class ChannelThread implements AutoWirable {
  private options: Required<ChannelThreadOptions>;

  public chatMembers: ExtendedSet<string> = new ExtendedSet();

  public chantHandler: ChantHandler;
  public commandHandler: CommandHandler;
  public commandTimerHandler: CommandTimerHandler;

  @Wirable() private isolate: Isolate;

  public messages: CacheFIFO<string>;
  public readonly refreshChatMembersJobName: string;
  private jobs: ExtendedMap<string, ExtendedCron> = new ExtendedMap();

  private static defaultOptions: RequiredDefaults<ChannelThreadOptions> = {
    messageCacheSize: 100,
  };

  constructor(public __parent: ClassInstance, public channel: ChannelWithUser, options: ChannelThreadOptions = {}) {
    this.options = mergeOptions(options, ChannelThread.defaultOptions);

    this.messages = new CacheFIFO(this.options.messageCacheSize);

    this.chantHandler = new ChantHandler(this);
    this.commandHandler = new CommandHandler(this);
    this.commandTimerHandler = new CommandTimerHandler(this);

    this.isolate = new Isolate({ memoryLimit: 32 });

    this.refreshChatMembersJobName = `ChannelThread:${this.channel.user.login}:refreshChatMembers`;
  }

  public async init(): Promise<void> {
    await this.startChatMemberSyncing();
    await this.commandHandler.init();
    await this.commandTimerHandler.init();
  }

  public destroy(): void {
    this.stopChatMemberSyncing();

    this.commandTimerHandler.destroy();

    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();

    this.isolate.dispose();
  }

  public async handleMessage(self: boolean, message: MessageWithUser): Promise<void> {
    await this.chantHandler.handleMessage(self, message);
    await this.commandHandler.handleMessage(self, message);
    await this.commandTimerHandler.processMessage(self, message);

    this.messages.push(message.content);
  }

  public updateConfig(options: ChannelThreadOptions): void {
    this.options = { ...this.options, ...options };

    this.messages.setMaxLength(this.options.messageCacheSize);
  }

  private syncChatMembers = async (): Promise<void> => {
    const chatters = await getChatters(this.channel.user.id, 1000);
    const mappedChatters = chatters.users.map((chatter) => chatter.user_id);

    this.chatMembers = new ExtendedSet(mappedChatters);
  };

  private async startChatMemberSyncing(): Promise<void> {
    const job = new ExtendedCron('? */5 * * * *', {
      name: this.refreshChatMembersJobName,
    }, this.syncChatMembers);

    await job.trigger();

    this.jobs.set(this.refreshChatMembersJobName, job);
  }

  private stopChatMemberSyncing(): void {
    this.jobs.get(this.refreshChatMembersJobName)?.stop();
    this.jobs.delete(this.refreshChatMembersJobName);
  }

  public async syncChannel(): Promise<void> {
    this.channel = await prisma.channel.getByUserIdOrFail(this.channel.userId);
  }
}
