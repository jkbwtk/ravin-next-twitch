import { ChannelThread, ChannelThreadInformation, ChannelThreadStreamStatus } from '#bot/ChannelThread';
import { BehaviorProfileController } from '#database/controllers/BehaviorProfileController';
import { BotActionController } from '#database/controllers/BotActionController';
import { AutoWirable, ClassInstance, wire } from '#lib/autowire';
import { BotActionType } from '#types/api/botActions';
import { BehaviorProfile, BehaviorProfileWithRelatedIds, BehaviorProfileWithRelations } from '#types/database/tables';
import { RegExpType } from '#types/regExp';


export class BehaviorProfilesHandler implements AutoWirable {
  public behaviorProfiles = new Map<number, BehaviorProfileWithRelatedIds>();

  private activeProfiles = new Map<number, BehaviorProfileWithRelatedIds>();

  private channelThread: ChannelThread;

  constructor(public __parent: ClassInstance) {
    this.channelThread = wire(this, ChannelThread);
  }

  public async init(): Promise<void> {
    await this.loadAll();

    this.registerSignalHandlers();
  }

  public destroy(): void {
    this.unregisterSignalHandlers();

    this.removeAll();
  }

  public async handleChannelInformation(info: ChannelThreadInformation): Promise<void> {
    const activeProfiles = new Map<number, BehaviorProfileWithRelatedIds>();

    for (const profile of this.behaviorProfiles.values()) {
      if (profile.activatorTitle !== null) {
        const activator = RegExpType.parse(profile.activatorTitle);

        if (activator.test(info.title)) {
          activeProfiles.set(profile.id, profile);

          if (!this.activeProfiles.has(profile.id)) {
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

        if (activator.test(info.game_name)) {
          activeProfiles.set(profile.id, profile);

          if (!this.activeProfiles.has(profile.id)) {
            await BotActionController.createFromType(
              this.channelThread.channel.userId,
              BotActionType.BehaviorProfileActivatedCategory,
              profile.name,
              info.game_name,
            );
          }
        }
      }
    }

    for (const [profileId, profile] of this.activeProfiles.entries()) {
      if (!activeProfiles.has(profileId)) {
        await BotActionController.createFromType(
          this.channelThread.channel.userId,
          BotActionType.BehaviorProfileDeactivated,
          profile.name,
        );
      }
    }

    this.activeProfiles = activeProfiles;
  }

  public handleStreamStatus(stream: ChannelThreadStreamStatus): void {}

  public getActiveProfiles(): BehaviorProfileWithRelatedIds[] {
    return Array.from(this.activeProfiles.values());
  }

  public add = (profile: BehaviorProfileWithRelations | null): void => {
    if (profile === null) return;
    if (profile.enabled === false) return;

    this.behaviorProfiles.set(profile.id, BehaviorProfileController.$utils.mapToRelatedIds(profile));
  };

  public remove = (profile: BehaviorProfile | null): void => {
    if (profile === null) return;
    this.behaviorProfiles.delete(profile.id);
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
