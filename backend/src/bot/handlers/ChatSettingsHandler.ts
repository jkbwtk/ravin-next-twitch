import { ChannelThread } from '#bot/ChannelThread';
import { ChannelInformationService } from '#bot/handlers/ChannelInformationService';
import { BotActionController } from '#database/controllers/BotActionController';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { updateChatSettings } from '#lib/twitch';
import { Subscription } from '#shared/signal';
import { BotActionType } from '#types/api/botActions';
import { ChannelThreadStreamStatus } from '#types/bot/channelThread';


export class ChantSettingsHandler implements AutoWirable {
  private channelThread: ChannelThread;
  private channelInformationService: ChannelInformationService;

  private channelInformationSubscription: Subscription;

  constructor(public __parent: ClassInstance) {
    this.channelThread = wire(this, ChannelThread);
    this.channelInformationService = wire(this, ChannelInformationService);

    this.channelInformationSubscription = this.channelInformationService.streamStatusChanged.subscribe(this.handleStreamStatusChanged);
  }

  public async init(): Promise<void> {
  }

  public destroy(): void {
    this.channelInformationSubscription.unsubscribe();
  }

  public handleStreamStatusChanged = async (streamStatus: ChannelThreadStreamStatus | null): Promise<void> => {
    if (this.channelThread.channel.offlineChatSettings.enabled === false) return;

    const isLive = streamStatus !== null;


    const settings = isLive ?
      this.channelThread.channel.offlineChatSettings.liveSettings :
      this.channelThread.channel.offlineChatSettings.offlineSettings;

    await updateChatSettings(this.channelThread.channel.userId, {
      emote_mode: settings.emoteMode,
      follower_mode: settings.followerMode,
      follower_mode_duration: settings.followerModeDuration,
      slow_mode: settings.slowMode,
      slow_mode_wait_time: settings.slowModeWaitTime,
      subscriber_mode: settings.subscriberMode,
      unique_chat_mode: settings.uniqueChatMode,
    });

    const actionType = isLive ? BotActionType.ChatSettingsChangedLive : BotActionType.ChatSettingsChangedOffline;

    await BotActionController.createFromType(
      this.channelThread.channel.userId,
      actionType,
      this.channelThread.channel.user.displayName,
    );
  };
};
