import { ExtendedMap } from '#lib/ExtendedMap';
import ExtendedSet from '#lib/ExtendedSet';
import { getChannelInformation, getChatters, getStreams } from '#lib/twitch';
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
import { TwitchChannelInformation, TwitchStream } from '#types/twitch';
import { SocketServer } from '#server/SocketServer';
import { ChannelController } from '#database/controllers/ChannelController';
import { ChannelWithUser, Message } from '#types/database/tables';
import { logger } from '#lib/logger';
import { BehaviorProfilesHandler } from '#bot/handlers/BehaviorProfilesHandler';
import { BehaviorProfilesStatus } from '#types/api/behaviorProfiles';
import { BehaviorProfileController } from '#database/controllers/BehaviorProfileController';
import { BehaviorProfileSerializer } from '#database/serializers/BehaviorProfileSerializer';
import { ChannelThreadInformation, ChannelThreadStreamStatus } from '#types/bot/channelThread';

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
  @Wirable() public behaviorProfilesHandler: BehaviorProfilesHandler;

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
    this.behaviorProfilesHandler = new BehaviorProfilesHandler(this);

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
    await this.behaviorProfilesHandler.init();

    this.registerSignalHandlers();
  }

  public destroy(): void {
    this.unregisterSignalHandlers();

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

  public async handleChannelInformation(info: TwitchChannelInformation | null): Promise<void> {
    const oldInfo = structuredClone(this.channelInformation);
    let profilesChanged = false;

    if (info !== null) {
      this.channelInformation = {
        gameId: info.game_id,
        gameName: info.game_name,
        title: info.title,
        delay: info.delay,
        tags: info.tags,
      };
    }

    if (this.channelInformation !== null) {
      profilesChanged = await this.behaviorProfilesHandler.handleChannelInformation(this.channelInformation);
    }

    if (
      profilesChanged ||
      oldInfo?.title !== this.channelInformation?.title ||
      oldInfo?.gameId !== this.channelInformation?.gameId
    ) {
      SocketServer.emitToUser(this.channel.userId, 'UPD_BEHAVIOR_PROFILE_STATUS', await this.getBehaviorProfilesStatus());
    }
  };

  public async handleStreamStatus(stream: TwitchStream | null): Promise<void> {
    const oldStream = structuredClone(this.streamStatus);
    const oldInfo = structuredClone(this.channelInformation);
    let profilesChanged = false;

    this.streamStatus = stream === null ? null : {
      id: stream.id,
      viewerCount: stream.viewer_count,
      startedAt: new Date(stream.started_at),
      language: stream.language,
      thumbnailUrl: stream.thumbnail_url,
      isMature: stream.is_mature,
    };

    if (stream && this.channelInformation) {
      this.channelInformation = {
        ...this.channelInformation,
        title: stream.title,
        gameName: stream.game_name,
        gameId: stream.game_id,
        tags: stream.tags,
      };

      profilesChanged = await this.behaviorProfilesHandler.handleChannelInformation(this.channelInformation);
    }

    if (this.streamStatus !== null) {
      profilesChanged = profilesChanged ? profilesChanged : await this.behaviorProfilesHandler.handleStreamStatus(this.streamStatus);
    }

    if (
      profilesChanged ||
      oldStream?.viewerCount !== this.streamStatus?.viewerCount ||
      oldStream?.thumbnailUrl !== this.streamStatus?.thumbnailUrl ||
      oldStream?.id !== this.streamStatus?.id ||
      oldInfo?.title !== this.channelInformation?.title ||
      oldInfo?.gameId !== this.channelInformation?.gameId
    ) {
      SocketServer.emitToUser(this.channel.userId, 'UPD_BEHAVIOR_PROFILE_STATUS', await this.getBehaviorProfilesStatus());
    }
  }

  public async getBehaviorProfilesStatus(): Promise<BehaviorProfilesStatus> {
    const activatedProfiles = await BehaviorProfileController.getByUserIdWithRelations(this.channel.userId, {
      idListFilter: {
        id: {
          in: this.behaviorProfilesHandler.getActiveProfiles().map((profile) => profile.id),
        },
      },
    });

    return {
      channelInformation: this.channelInformation,
      streamStatus: this.streamStatus,
      activeProfiles: BehaviorProfileSerializer(activatedProfiles),
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

  public syncChannelInformation = async (): Promise<void> => {
    const channelInformation = await getChannelInformation(this.channel.userId);
    await this.handleChannelInformation(channelInformation);
  };

  private async startChannelInformationSyncing(): Promise<void> {
    const job = new ExtendedCron('* * * * *', {
      name: this.refreshChannelInformationJobName,
    }, this.syncChannelInformation);

    await job.trigger();

    this.jobs.set(this.refreshChannelInformationJobName, job);
  }

  private stopChannelInformationSyncing(): void {
    this.jobs.get(this.refreshChannelInformationJobName)?.stop();
    this.jobs.delete(this.refreshChannelInformationJobName);
  }

  public syncStreamStatus = async (): Promise<void> => {
    const stream = await getStreams(this.channel.userId);
    await this.handleStreamStatus(stream);

    if (this.channelInformation !== null && stream !== null) {
      // @ts-expect-error unused parameters
      await this.handleChannelInformation({
        ...this.channelInformation,

        title: stream.title,
        game_id: stream.game_id,
        game_name: stream.game_name,
        tags: stream.tags,

        broadcaster_id: stream.user_id,
        broadcaster_name: stream.user_name,
        broadcaster_login: stream.user_login,
        broadcaster_language: stream.language,
      });
    }
  };

  private async startStreamStatusSyncing(): Promise<void> {
    const job = new ExtendedCron('15,45 * * * * *', {
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
    const channel = await ChannelController.getByUserId(this.channel.userId);

    if (channel === null) {
      logger.warn('Failed to get channel for user [%s]', this.channel.userId, {
        label: ['ChannelThread', 'syncChannel'],
      });

      return;
    }

    this.channel = channel;
  }

  private registerSignalHandlers(): void {
    ChannelController.$signals.registerAfter('update', this.syncChannel);
  }

  private unregisterSignalHandlers(): void {
    ChannelController.$signals.unregisterAfter('update', this.syncChannel);
  }
}
