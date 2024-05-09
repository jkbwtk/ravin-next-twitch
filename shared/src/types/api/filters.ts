import { PaginatedResponse } from '../pagination';
import { z } from 'zod';


export enum Actions {
  Delete = 0,
  Timeout = 1,
  Ban = 2,
}

export const FilterActions = z.nativeEnum(Actions);

export type FilterActions = z.infer<typeof FilterActions>;


export const PhraseFilter = z.object({
  id: z.number().int().positive(),
  phrase: z.string().min(1),
  caseSensitive: z.boolean(),
  ignoreWhitespace: z.boolean(),
  similarity: z.number().int().min(0).max(100),
  action: FilterActions,
  actionDuration: z.number().int().positive().default(10),
  reason: z.string().optional().nullable().default(null),
  enabled: z.boolean().default(true),
});

export type PhraseFilter = z.infer<typeof PhraseFilter>;

export const GetPhraseFiltersResponse = z.object({
  data: z.array(PhraseFilter),
});

export type GetPhraseFiltersResponse = z.infer<typeof GetPhraseFiltersResponse>;


export const GetPhraseFiltersPaginatedResponse = PaginatedResponse(GetPhraseFiltersResponse);

export type GetPhraseFiltersPaginatedResponse = z.infer<typeof GetPhraseFiltersPaginatedResponse>;


export const PostPhraseFilterReqBody = PhraseFilter.omit({ id: true });

export type PostPhraseFilterReqBody = z.infer<typeof PostPhraseFilterReqBody>;


export const PatchPhraseFilterReqBody = PhraseFilter.pick({ id: true }).merge(PostPhraseFilterReqBody.partial());

export type PatchPhraseFilterReqBody = z.infer<typeof PatchPhraseFilterReqBody>;


export const DeletePhraseFilterReqBody = PhraseFilter.pick({ id: true });

export type DeletePhraseFilterReqBody = z.infer<typeof DeletePhraseFilterReqBody>;

export const RegExpLiteralType = z.string().regex(/^\/.*\/.*$/).superRefine((val, ctx) => {
  const regexDeserializer = /^\/(.*)\/(.*)$/;
  const matched = val.match(regexDeserializer);

  if (matched === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid regex format. Must be in the form of /regex/flags',
      fatal: true,
    });

    return z.NEVER;
  }

  try {
    const pattern = matched[1]!;
    const flags = matched[2]!;

    new RegExp(pattern, flags);
  } catch (err) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: err instanceof Error ? err.message : 'Unknown error',
      fatal: true,
    });
  }
});

export type RegExpLiteralType = z.infer<typeof RegExpLiteralType>;


export const RegExpType = RegExpLiteralType.transform<RegExp>((val) => {
  const regexDeserializer = /^\/(.*)\/(.*)$/;
  const matched = val.match(regexDeserializer);

  if (!matched) {
    throw new Error('Invalid regex format. Must be in the form of /regex/flags');
  }

  const pattern = matched[1]!;
  const flags = matched[2]!;

  return new RegExp(pattern, flags);
});

export type RegExpType = z.infer<typeof RegExpType>;


export const RegexFilter = z.object({
  id: z.number().int().positive(),
  regex: RegExpLiteralType,
  action: FilterActions,
  actionDuration: z.number().int().positive().default(10),
  reason: z.string().optional().nullable().default(null),
  enabled: z.boolean().default(true),
});

export type RegexFilter = z.infer<typeof RegexFilter>;


export const GetRegexFiltersResponse = z.object({
  data: z.array(RegexFilter),
});

export type GetRegexFiltersResponse = z.infer<typeof GetRegexFiltersResponse>;


export const GetRegexFiltersPaginatedResponse = PaginatedResponse(GetRegexFiltersResponse);

export type GetRegexFiltersPaginatedResponse = z.infer<typeof GetRegexFiltersPaginatedResponse>;


export const PostRegexFilterReqBody = RegexFilter.omit({ id: true });

export type PostRegexFilterReqBody = z.infer<typeof PostRegexFilterReqBody>;


export const PatchRegexFilterReqBody = RegexFilter.pick({ id: true }).merge(PostRegexFilterReqBody.partial());

export type PatchRegexFilterReqBody = z.infer<typeof PatchRegexFilterReqBody>;


export const DeleteRegexFilterReqBody = RegexFilter.pick({ id: true });

export type DeleteRegexFilterReqBody = z.infer<typeof DeleteRegexFilterReqBody>;
