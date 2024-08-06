import { PaginatedResponse } from '../pagination';
import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { phraseFiltersTable, regexFiltersTable } from '../../schema/schema';


export enum Actions {
  Delete = 0,
  Timeout = 1,
  Ban = 2,
}

export const FilterActions = z.nativeEnum(Actions);

export type FilterActions = z.infer<typeof FilterActions>;


export const PhraseFilterApi = createSelectSchema(phraseFiltersTable, {
  id: (schema) => schema.id.int().positive(),
  phrase: (schema) => schema.phrase.min(1),
  similarity: (schema) => schema.similarity.int().min(0).max(100),
  action: () => FilterActions,
  actionDuration: (schema) => schema.actionDuration.int().positive().default(10),
  reason: (schema) => schema.reason.optional().nullable().default(null),
  enabled: (schema) => schema.enabled.default(true),
}).pick({
  id: true,
  phrase: true,
  caseSensitive: true,
  ignoreWhitespace: true,
  similarity: true,
  action: true,
  actionDuration: true,
  reason: true,
  enabled: true,
});

export type PhraseFilterApi = z.infer<typeof PhraseFilterApi>;

export const GetPhraseFiltersResponse = z.object({
  data: z.array(PhraseFilterApi),
});

export type GetPhraseFiltersResponse = z.infer<typeof GetPhraseFiltersResponse>;


export const GetPhraseFiltersPaginatedResponse = PaginatedResponse(GetPhraseFiltersResponse);

export type GetPhraseFiltersPaginatedResponse = z.infer<typeof GetPhraseFiltersPaginatedResponse>;


export const PostPhraseFilterReqBody = PhraseFilterApi.omit({ id: true });

export type PostPhraseFilterReqBody = z.infer<typeof PostPhraseFilterReqBody>;


export const PatchPhraseFilterReqBody = PhraseFilterApi.pick({ id: true }).merge(PostPhraseFilterReqBody.partial());

export type PatchPhraseFilterReqBody = z.infer<typeof PatchPhraseFilterReqBody>;


export const DeletePhraseFilterReqBody = PhraseFilterApi.pick({ id: true });

export type DeletePhraseFilterReqBody = z.infer<typeof DeletePhraseFilterReqBody>;


export const RegexFilterApi = createSelectSchema(regexFiltersTable, {
  id: (schema) => schema.id.int().positive(),
  regex: (schema) => schema.regex,
  action: () => FilterActions,
  actionDuration: (schema) => schema.actionDuration.int().positive().default(10),
  reason: (schema) => schema.reason.optional().nullable().default(null),
  enabled: (schema) => schema.enabled.default(true),
}).pick({
  id: true,
  regex: true,
  action: true,
  actionDuration: true,
  reason: true,
  enabled: true,
});

export type RegexFilterApi = z.infer<typeof RegexFilterApi>;


export const GetRegexFiltersResponse = z.object({
  data: z.array(RegexFilterApi),
});

export type GetRegexFiltersResponse = z.infer<typeof GetRegexFiltersResponse>;


export const GetRegexFiltersPaginatedResponse = PaginatedResponse(GetRegexFiltersResponse);

export type GetRegexFiltersPaginatedResponse = z.infer<typeof GetRegexFiltersPaginatedResponse>;


export const PostRegexFilterReqBody = RegexFilterApi.omit({ id: true });

export type PostRegexFilterReqBody = z.infer<typeof PostRegexFilterReqBody>;


export const PatchRegexFilterReqBody = RegexFilterApi.pick({ id: true }).merge(PostRegexFilterReqBody.partial());

export type PatchRegexFilterReqBody = z.infer<typeof PatchRegexFilterReqBody>;


export const DeleteRegexFilterReqBody = RegexFilterApi.pick({ id: true });

export type DeleteRegexFilterReqBody = z.infer<typeof DeleteRegexFilterReqBody>;
