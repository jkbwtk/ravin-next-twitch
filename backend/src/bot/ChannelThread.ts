import { ExtendedMap } from '#lib/ExtendedMap';
import ExtendedSet from '#lib/ExtendedSet';
import { getChannelInformation, getChatters, getStreams } from '#lib/twitch';
import { ChannelWithUser } from '#database/extensions/channel';
import { prisma } from '#database/database';
import { ExtendedCron } from '#lib/ExtendedCron';
import { ChantHandler } from '#bot/handlers/ChantHandler';
import { mergeOptions, RequiredDefaults } from '#shared/utils';
import { CacheFIFO } from '#lib/CacheArray';
import { CommandHandler } from '#bot/handlers/CommandHandler';
import { MessageWithUser } from '#database/extensions/message';
import { AutoWirable, ClassInstance, Wirable } from '#lib/autowire';
import { CommandTimerHandler } from '#bot/handlers/CommandTimerHandler';
import { Isolate } from 'isolated-vm';
import { RegexFilterHandler } from '#bot/handlers/RegexFilterHandler';
import { PhraseFilterHandler } from '#bot/handlers/PhraseFilterHandler';
import { TwitchChannelInformation, TwitchStream } from '#shared/types/twitch';


export type ChannelThreadInformation = {
  game_id: string;
  game_name: string;
  title: string;
  delay: number;
  tags: string[];
  content_classification_labels: string[];
  is_branded_content: boolean;
};

export type ChannelThreadStreamStatus = {
  id: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  is_mature: boolean;
};

export type ChannelThreadOptions = {
  messageCacheSize?: number;
};

export class ChannelThread implements AutoWirable {
  private options: Required<ChannelThreadOptions>;

  public chatMembers: ExtendedSet<string> = new ExtendedSet();
  public channelInformation: ChannelThreadInformation | null = null;
  public streamStatus: ChannelThreadStreamStatus | null = null;

  public chantHandler: ChantHandler;
  public commandHandler: CommandHandler;
  public commandTimerHandler: CommandTimerHandler;
  public phraseFilterHandler: PhraseFilterHandler;
  public regexFilterHandler: RegexFilterHandler;

  @Wirable() private isolate: Isolate;

  public messages: CacheFIFO<string>;
  public readonly refreshChatMembersJobName: string;
  public readonly refreshChannelInformationJobName: string;
  public readonly refreshStreamStatusJobName: string;
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
    this.phraseFilterHandler = new PhraseFilterHandler(this);
    this.regexFilterHandler = new RegexFilterHandler(this);

    this.isolate = new Isolate({ memoryLimit: 32 });

    this.refreshChatMembersJobName = `ChannelThread:${this.channel.user.login}:refreshChatMembers`;
    this.refreshChannelInformationJobName = `ChannelThread:${this.channel.user.login}:refreshChannelInformation`;
    this.refreshStreamStatusJobName = `ChannelThread:${this.channel.user.login}:refreshStreamStatus`;
  }

  public async init(): Promise<void> {
    await this.startChatMemberSyncing();
    await this.startChannelInformationSyncing();
    await this.startStreamStatusSyncing();

    await this.commandHandler.init();
    await this.commandTimerHandler.init();
    await this.phraseFilterHandler.init();
    await this.regexFilterHandler.init();
  }

  public destroy(): void {
    this.commandTimerHandler.destroy();

    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();

    this.isolate.dispose();
  }

  public async handleMessage(self: boolean, message: MessageWithUser): Promise<void> {
    await this.chantHandler.handleMessage(self, message);
    await this.commandHandler.handleMessage(self, message);
    await this.commandTimerHandler.processMessage(self, message);

    // Handle phrase filters first, if it returns false, handle regex filters
    if (await this.phraseFilterHandler.handleMessage(self, message) === false) {
      await this.regexFilterHandler.handleMessage(self, message);
    }

    this.messages.push(message.content);
  }

  public async handleChannelInformation(info: TwitchChannelInformation | null): Promise<void> {
    if (info !== null) {
      this.channelInformation = {
        game_id: info.game_id,
        game_name: info.game_name,
        title: info.title,
        delay: info.delay,
        tags: info.tags,
        content_classification_labels: info.content_classification_labels,
        is_branded_content: info.is_branded_content,
      };
    }
  };

  public async handleStreamStatus(stream: TwitchStream | null): Promise<void> {
    this.streamStatus = stream === null ? null : {
      id: stream.id,
      viewer_count: stream.viewer_count,
      started_at: stream.started_at,
      language: stream.language,
      thumbnail_url: stream.thumbnail_url,
      is_mature: stream.is_mature,
    };
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

  private syncChannelInformation = async (): Promise<void> => {
    const channelInformation = await getChannelInformation(this.channel.userId);
    await this.handleChannelInformation(channelInformation);
  };

  private async startChannelInformationSyncing(): Promise<void> {
    const job = new ExtendedCron('*/30 * * * * *', {
      name: this.refreshChannelInformationJobName,
    }, this.syncChannelInformation);

    await job.trigger();

    this.jobs.set(this.refreshChannelInformationJobName, job);
  }

  private stopChannelInformationSyncing(): void {
    this.jobs.get(this.refreshChannelInformationJobName)?.stop();
    this.jobs.delete(this.refreshChannelInformationJobName);
  }

  private syncStreamStatus = async (): Promise<void> => {
    const stream = await getStreams(this.channel.userId);
    await this.handleStreamStatus(stream);
  };

  private async startStreamStatusSyncing(): Promise<void> {
    const job = new ExtendedCron('*/30 * * * * *', {
      name: this.refreshStreamStatusJobName,
    }, this.syncStreamStatus);

    await job.trigger();

    this.jobs.set(this.refreshStreamStatusJobName, job);
  }

  private stopStreamStatusSyncing(): void {
    this.jobs.get(this.refreshStreamStatusJobName)?.stop();
    this.jobs.delete(this.refreshStreamStatusJobName);
  }

  public async syncChannel(): Promise<void> {
    this.channel = await prisma.channel.getByUserIdOrFail(this.channel.userId);
  }
}
