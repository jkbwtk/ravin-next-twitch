import { CustomCommandSerializer } from '#database/serializers/CommandSerializer';
import { CommandTimerSerializer } from '#database/serializers/CommandTImerSerializer';
import { PhraseFilterSerializer } from '#database/serializers/PhrazeFilterSerializer';
import { RegexFilterSerializer } from '#database/serializers/RegexFilterSerializer';
import { serializer } from '#lib/serializer';
import { AvailableRelatedItemsApi, BehaviorProfileApi } from '#types/api/behaviorProfiles';
import { BehaviorProfileWithRelations, Command, CommandTimer, PhraseFilter, RegexFilter } from '#types/database/tables';


export type AvailableRelatedItems = {
  commands: Command[];
  phraseFilters: PhraseFilter[];
  regexFilters: RegexFilter[];
  commandTimers: CommandTimer[];
};

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


export const AvailableRelatedItemsSerializer = serializer<AvailableRelatedItems, AvailableRelatedItemsApi>((items) => ({
  commands: items.commands.map((command) => ({ id: command.id, name: command.command })),
  phraseFilters: items.phraseFilters.map((filter) => ({ id: filter.id, name: filter.phrase })),
  regexFilters: items.regexFilters.map((filter) => ({ id: filter.id, name: filter.regex })),
  commandTimers: items.commandTimers.map((timer) => ({ id: timer.id, name: timer.name })),
}));
