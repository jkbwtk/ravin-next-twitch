import { ExtendedMap } from '#lib/ExtendedMap';
import ExtendedSet from '#lib/ExtendedSet';
import { getChatters } from '#lib/twitch';
import { ExtendedCron } from '#lib/ExtendedCron';
import { ChantHandler } from '#bot/handlers/ChantHandler';
import { mergeOptions, RequiredDefaults } from '#shared/utils';
import { CacheFIFO } from '#lib/CacheArray';
import { CommandHandler } from '#bot/handlers/CommandHandler';
import { AutoWirable, ClassInstance, Wirable } from '#lib/autowire';
import { CommandTimerHandler } from '#bot/handlers/CommandTimerHandler';
import { Isolate } from 'isolated-vm';
import { RegexFilterHandler } from '#bot/handlers/RegexFilterHandler';
import { PhraseFilterHandler } from '#bot/handlers/PhraseFilterHandler';
import { ChannelController } from '#database/controllers/ChannelController';
import { ChannelWithUser, Message } from '#types/database/tables';
import { logger } from '#lib/logger';
import { BehaviorProfilesHandler } from '#bot/handlers/BehaviorProfilesHandler';
import { BehaviorProfilesStatus } from '#types/api/behaviorProfiles';
import { BehaviorProfileSerializer } from '#database/serializers/BehaviorProfileSerializer';
import { ChannelInformationService } from '#bot/handlers/ChannelInformationService';


export type ChannelThreadOptions = {
  messageCacheSize?: number;
};

export class ChannelThread implements AutoWirable {
  private options: Required<ChannelThreadOptions>;

  public chatMembers: ExtendedSet<string> = new ExtendedSet();

  @Wirable() public channelInformationService: ChannelInformationService;

  public chantHandler: ChantHandler;
  public commandHandler: CommandHandler;
  public commandTimerHandler: CommandTimerHandler;
  public phraseFilterHandler: PhraseFilterHandler;
  public regexFilterHandler: RegexFilterHandler;
  @Wirable() public behaviorProfilesHandler: BehaviorProfilesHandler;

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

    this.channelInformationService = new ChannelInformationService(this);
    this.behaviorProfilesHandler = new BehaviorProfilesHandler(this);

    this.chantHandler = new ChantHandler(this);
    this.commandHandler = new CommandHandler(this);
    this.commandTimerHandler = new CommandTimerHandler(this);
    this.phraseFilterHandler = new PhraseFilterHandler(this);
    this.regexFilterHandler = new RegexFilterHandler(this);

    this.isolate = new Isolate({ memoryLimit: 32 });

    this.refreshChatMembersJobName = `ChannelThread:${this.channel.user.login}:refreshChatMembers`;
  }

  public async init(): Promise<void> {
    await this.startChatMemberSyncing();

    await this.channelInformationService.init();

    await this.commandHandler.init();
    await this.commandTimerHandler.init();
    await this.phraseFilterHandler.init();
    await this.regexFilterHandler.init();
    await this.behaviorProfilesHandler.init();

    this.registerSignalHandlers();
  }

  public destroy(): void {
    this.unregisterSignalHandlers();

    this.channelInformationService.destroy();

    this.commandHandler.destroy();
    this.commandTimerHandler.destroy();
    this.phraseFilterHandler.destroy();
    this.regexFilterHandler.destroy();
    this.behaviorProfilesHandler.destroy();

    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();

    this.isolate.dispose();
  }

  public async handleMessage(self: boolean, message: Message): Promise<void> {
    await this.chantHandler.handleMessage(self, message);
    await this.commandHandler.handleMessage(self, message);
    await this.commandTimerHandler.processMessage(self, message);

    // Handle phrase filters first, if it returns false, handle regex filters
    if (await this.phraseFilterHandler.handleMessage(self, message) === false) {
      await this.regexFilterHandler.handleMessage(self, message);
    }

    this.messages.push(message.content);
  }

  public async getBehaviorProfilesStatus(): Promise<BehaviorProfilesStatus> {
    return {
      channelInformation: this.channelInformationService.channelInformation(),
      streamStatus: this.channelInformationService.streamStatus(),
      activeProfiles: BehaviorProfileSerializer(await this.behaviorProfilesHandler.getActiveProfilesWithRelations()),
    };
  }

  public updateConfig(options: ChannelThreadOptions): void {
    this.options = { ...this.options, ...options };

    this.messages.setMaxLength(this.options.messageCacheSize);
  }

  public syncChatMembers = async (): Promise<void> => {
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

  public syncChannel = async (): Promise<void> => {
    const channel = await ChannelController.getByUserId(this.channel.userId);

    if (channel === null) {
      logger.warn('Failed to get channel for user [%s]', this.channel.userId, {
        label: ['ChannelThread', 'syncChannel'],
      });

      return;
    }

    this.channel = channel;
  };

  private registerSignalHandlers(): void {
    ChannelController.$signals.registerAfter('updateByUserId', this.syncChannel);
  }

  private unregisterSignalHandlers(): void {
    ChannelController.$signals.unregisterAfter('updateByUserId', this.syncChannel);
  }
}
