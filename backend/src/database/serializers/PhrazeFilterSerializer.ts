import { serializer } from '#lib/serializer';
import { PhraseFilterApi } from '#types/api/filters';
import { PhraseFilter } from '#types/database/tables';


export const PhraseFilterSerializer = serializer<PhraseFilter, PhraseFilterApi>((filter) => ({
  id: filter.id,
  phrase: filter.phrase,
  caseSensitive: filter.caseSensitive,
  ignoreWhitespace: filter.ignoreWhitespace,
  similarity: filter.similarity,
  action: filter.action,
  actionDuration: filter.actionDuration,
  reason: filter.reason,
  enabled: filter.enabled,
}));
