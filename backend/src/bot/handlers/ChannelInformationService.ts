import { ChannelThread } from '#bot/ChannelThread';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { ExtendedCron } from '#lib/ExtendedCron';
import { ExtendedMap } from '#lib/ExtendedMap';
import { getChannelInformation, getStreams } from '#lib/twitch';
import { SocketServer } from '#server/SocketServer';
import { basicSignal } from '#shared/signal';
import { ChannelThreadInformation, ChannelThreadStreamStatus } from '#types/bot/channelThread';
import { isDeepStrictEqual } from 'util';


export class ChannelInformationService implements AutoWirable {
  public channelInformation = basicSignal<ChannelThreadInformation | null>(null);
  public streamStatus = basicSignal<ChannelThreadStreamStatus | null>(null);

  public readonly refreshChannelInformationJobName: string;
  public readonly refreshStreamStatusJobName: string;

  private channelThread: ChannelThread;

  private jobs: ExtendedMap<string, ExtendedCron> = new ExtendedMap();

  constructor(public __parent: ClassInstance) {
    this.channelThread = wire(this, ChannelThread);

    this.refreshChannelInformationJobName = `ChannelThread:${this.channelThread.channel.user.login}:refreshChannelInformation`;
    this.refreshStreamStatusJobName = `ChannelThread:${this.channelThread.channel.user.login}:refreshStreamStatus`;
  }

  public async init(): Promise<void> {
    await this.startChannelInformationSyncing();
    await this.startStreamStatusSyncing();
  }

  public destroy(): void {
    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();
  }

  public async handleChannelInformation(info: ChannelThreadInformation | null): Promise<void> {
    const oldInfo = structuredClone(this.channelInformation());

    if (info !== null) {
      if (isDeepStrictEqual(info, oldInfo)) return;

      this.channelInformation.set(info);

      SocketServer.emitToUser(
        this.channelThread.channel.userId,
        'UPD_BEHAVIOR_PROFILE_STATUS',
        await this.channelThread.getBehaviorProfilesStatus(),
      );
    }
  };

  public async handleStreamStatus(stream: ChannelThreadStreamStatus | null): Promise<void> {
    const oldStream = structuredClone(this.streamStatus());

    if (stream !== null) {
      if (isDeepStrictEqual(stream, oldStream)) return;

      this.streamStatus.set(stream);

      SocketServer.emitToUser(
        this.channelThread.channel.userId,
        'UPD_BEHAVIOR_PROFILE_STATUS',
        await this.channelThread.getBehaviorProfilesStatus(),
      );
    }
  }

  public syncChannelInformation = async (): Promise<void> => {
    const channelInformation = await getChannelInformation(this.channelThread.channel.userId);

    await this.handleChannelInformation(channelInformation ? {
      title: channelInformation.title,
      gameName: channelInformation.game_name,
      gameId: channelInformation.game_id,
      delay: channelInformation.delay,
      tags: channelInformation.tags,
    } : null);
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
    const stream = await getStreams(this.channelThread.channel.userId);

    await this.handleStreamStatus(stream ? {
      id: stream.id,
      viewerCount: stream.viewer_count,
      startedAt: new Date(stream.started_at),
      isMature: stream.is_mature,
      language: stream.language,
      thumbnailUrl: stream.thumbnail_url,
    } : null);

    const channelInformation = this.channelInformation();

    if (channelInformation !== null && stream !== null) {
      await this.handleChannelInformation({
        ...channelInformation,

        title: stream.title,
        gameName: stream.game_name,
        gameId: stream.game_id,
        tags: stream.tags,
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
}
