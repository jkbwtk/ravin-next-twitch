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


type ResourceType = 'commandIds' | 'phraseFilterIds' | 'regexFilterIds' | 'commandTimerIds';

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

  public isResourceActive(id: number, type: ResourceType): boolean {
    if (this.activeProfiles.size === 0) return true;

    for (const profile of this.activeProfiles.values()) {
      if (profile[type].includes(id)) return true;
    }

    return false;
  }

  public handleChannelInformation = async (info: ChannelThreadInformation | null = this.channelInformationService.channelInformation()): Promise<void> => {
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

      if (profile.manuallyActivated === true) {
        activeProfiles.set(profile.id, profile);

        if (!this.activeProfiles.has(profile.id)) {
          changed = true;

          await BotActionController.createFromType(
            this.channelThread.channel.userId,
            BotActionType.BehaviorProfileActivatedManual,
            profile.name,
          );
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

  private checkOwnership = (profile: BehaviorProfile): boolean => {
    return profile.channelUserId === this.channelThread.channel.userId;
  };

  private _add = (profile: BehaviorProfileWithRelations | null): void => {
    if (profile === null) return;
    if (this.checkOwnership(profile) === false) return;
    if (profile.enabled === false) return;

    this.behaviorProfiles.set(profile.id, BehaviorProfileController.$utils.mapToRelatedIds(profile));
  };

  public add = (profile: BehaviorProfileWithRelations | null): void => {
    this._add(profile);
    this.handleChannelInformation();
  };

  private _remove = (profile: BehaviorProfile | null): void => {
    if (profile === null) return;
    if (this.checkOwnership(profile) === false) return;

    this.behaviorProfiles.delete(profile.id);
  };

  public remove = (profile: BehaviorProfile | null): void => {
    this._remove(profile);
    this.handleChannelInformation();
  };

  public update = (profile: BehaviorProfileWithRelations | null): void => {
    if (profile === null) return;
    if (this.checkOwnership(profile) === false) return;

    this._remove(profile);
    this._add(profile);

    this.handleChannelInformation();
  };

  private _removeAll(): void {
    this.behaviorProfiles.clear();
    this.activeProfiles.clear();
  }

  public removeAll(): void {
    this._removeAll();
    this.handleChannelInformation();
  }

  public async loadAll(): Promise<void> {
    const profiles = await BehaviorProfileController.getByUserIdWithRelations(this.channelThread.channel.userId);

    this._removeAll();
    profiles.forEach(this._add);

    this.handleChannelInformation();
  }

  public loadList(profiles: BehaviorProfileWithRelations[]): void {
    this._removeAll();
    profiles.forEach(this._add);

    this.handleChannelInformation();
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
