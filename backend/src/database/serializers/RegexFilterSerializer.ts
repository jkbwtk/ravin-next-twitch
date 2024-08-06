import { serializer } from '#lib/serializer';
import { RegexFilterApi } from '#types/api/filters';
import { RegexFilter } from '#types/database/tables';


export const RegexFilterSerializer = serializer<RegexFilter, RegexFilterApi>((filter) => ({
  id: filter.id,
  regex: filter.regex,
  action: filter.action,
  actionDuration: filter.actionDuration,
  reason: filter.reason,
  enabled: filter.enabled,
}));
