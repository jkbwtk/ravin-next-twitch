import { ChannelThread } from '#bot/ChannelThread';
import { ChannelInformationService } from '#bot/handlers/ChannelInformationService';
import { BehaviorProfileController } from '#database/controllers/BehaviorProfileController';
import { BotActionController } from '#database/controllers/BotActionController';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { SocketServer } from '#server/SocketServer';
import { Subscription } from '#shared/signal';
import { BotActionType } from '#types/api/botActions';
import { ChannelThreadInformation } from '#types/bot/channelThread';
import { BehaviorProfile, BehaviorProfileWithRelatedIds, BehaviorProfileWithRelations } from '#types/database/tables';
import { RegExpType } from '#types/regExp';


export class BehaviorProfilesHandler implements AutoWirable {
  public behaviorProfiles = new Map<number, BehaviorProfileWithRelatedIds>();

  private activeProfiles = new Map<number, BehaviorProfileWithRelatedIds>();

  private channelThread: ChannelThread;
  private channelInformationService: ChannelInformationService;

  private channelInformationSubscription: Subscription;

  constructor(public __parent: ClassInstance) {
    this.channelThread = wire(this, ChannelThread);
    this.channelInformationService = wire(this, ChannelInformationService);

    this.channelInformationSubscription = this.channelInformationService.channelInformation.subscribe(this.handleChannelInformation);
  }

  public async init(): Promise<void> {
    await this.loadAll();

    this.registerSignalHandlers();
  }

  public destroy(): void {
    this.unregisterSignalHandlers();

    this.channelInformationSubscription.unsubscribe();

    this.removeAll();
  }

  public getActiveProfiles(): BehaviorProfileWithRelatedIds[] {
    return Array.from(this.activeProfiles.values());
  }

  public async getActiveProfilesWithRelations(): Promise<BehaviorProfileWithRelations[]> {
    return await BehaviorProfileController.getByUserIdWithRelations(this.channelThread.channel.userId, {
      idListFilter: {
        id: {
          in: this.getActiveProfiles().map((profile) => profile.id),
        },
      },
    });
  }

  public handleChannelInformation = async (info: ChannelThreadInformation | null): Promise<void> => {
    if (info === null) return;

    const activeProfiles = new Map<number, BehaviorProfileWithRelatedIds>();

    let changed = false;

    for (const profile of this.behaviorProfiles.values()) {
      if (profile.activatorTitle !== null) {
        const activator = RegExpType.parse(profile.activatorTitle);

        if (activator.test(info.title)) {
          activeProfiles.set(profile.id, profile);

          if (!this.activeProfiles.has(profile.id)) {
            changed = true;

            await BotActionController.createFromType(
              this.channelThread.channel.userId,
              BotActionType.BehaviorProfileActivatedTitle,
              profile.name,
              info.title,
            );
          }
        }
      }

      if (profile.activatorCategory !== null) {
        const activator = RegExpType.parse(profile.activatorCategory);

        if (activator.test(info.gameName)) {
          activeProfiles.set(profile.id, profile);

          if (!this.activeProfiles.has(profile.id)) {
            changed = true;

            await BotActionController.createFromType(
              this.channelThread.channel.userId,
              BotActionType.BehaviorProfileActivatedCategory,
              profile.name,
              info.gameName,
            );
          }
        }
      }
    }

    for (const [profileId, profile] of this.activeProfiles.entries()) {
      if (!activeProfiles.has(profileId)) {
        changed = true;

        await BotActionController.createFromType(
          this.channelThread.channel.userId,
          BotActionType.BehaviorProfileDeactivated,
          profile.name,
        );
      }
    }

    if (changed) {
      this.activeProfiles = activeProfiles;

      SocketServer.emitToUser(
        this.channelThread.channel.userId,
        'UPD_BEHAVIOR_PROFILE_ACTIVE_PROFILES',
        await this.getActiveProfilesWithRelations(),
      );
    }

    this.activeProfiles = activeProfiles;
  };

  public add = (profile: BehaviorProfileWithRelations | null): void => {
    if (profile === null) return;
    if (profile.enabled === false) return;

    this.behaviorProfiles.set(profile.id, BehaviorProfileController.$utils.mapToRelatedIds(profile));

    this.handleChannelInformation(this.channelInformationService.channelInformation());
  };

  public remove = (profile: BehaviorProfile | null): void => {
    if (profile === null) return;

    this.behaviorProfiles.delete(profile.id);

    this.handleChannelInformation(this.channelInformationService.channelInformation());
  };

  public update = (profile: BehaviorProfileWithRelations | null): void => {
    if (profile === null) return;

    this.remove(profile);
    this.add(profile);
  };

  public removeAll(): void {
    this.behaviorProfiles.clear();
  }

  public async loadAll(): Promise<void> {
    const profiles = await BehaviorProfileController.getByUserIdWithRelations(this.channelThread.channel.userId);

    this.removeAll();
    profiles.forEach(this.add);
  }

  public loadList(profiles: BehaviorProfileWithRelations[]): void {
    this.removeAll();
    profiles.forEach(this.add);
  }

  private registerSignalHandlers(): void {
    BehaviorProfileController.$signals.registerAfter('createWithRelations', this.add);
    BehaviorProfileController.$signals.registerAfter('updateWithRelations', this.update);
    BehaviorProfileController.$signals.registerAfter('delete', this.remove);
  }

  private unregisterSignalHandlers(): void {
    BehaviorProfileController.$signals.unregisterAfter('createWithRelations', this.add);
    BehaviorProfileController.$signals.unregisterAfter('updateWithRelations', this.update);
    BehaviorProfileController.$signals.unregisterAfter('delete', this.remove);
  }
}
