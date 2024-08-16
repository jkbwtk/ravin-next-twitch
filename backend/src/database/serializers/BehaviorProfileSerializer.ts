import { CustomCommandSerializer } from '#database/serializers/CommandSerializer';
import { CommandTimerSerializer } from '#database/serializers/CommandTImerSerializer';
import { PhraseFilterSerializer } from '#database/serializers/PhrazeFilterSerializer';
import { RegexFilterSerializer } from '#database/serializers/RegexFilterSerializer';
import { serializer } from '#lib/serializer';
import { BehaviorProfileApi } from '#types/api/behaviorProfiles';
import { BehaviorProfileWithRelations } from '#types/database/tables';


export const BehaviorProfileSerializer = serializer<BehaviorProfileWithRelations, BehaviorProfileApi>((profile) => ({
  id: profile.id,
  name: profile.name,
  description: profile.description,
  enabled: profile.enabled,
  activatorCategory: profile.activatorCategory,
  activatorTitle: profile.activatorTitle,
  manuallyActivated: profile.manuallyActivated,
  commands: CustomCommandSerializer(profile.commands),
  phraseFilters: PhraseFilterSerializer(profile.phraseFilters),
  regexFilters: RegexFilterSerializer(profile.regexFilters),
  commandTimers: CommandTimerSerializer(profile.commandTimers),
}));
