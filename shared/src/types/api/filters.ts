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


export const RegExpType = z.preprocess((val, ctx) => {
  if (val instanceof RegExp) {
    return `/${val.source}/${val.flags}`;
  }

  if (typeof val !== 'string') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid regex format. Must be in the form of /regex/flags',
    });

    return val;
  }

  const regexDeserializer = /^\/(.*)\/(.*)$/;
  const matched = val.match(regexDeserializer);

  if (!matched) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid regex format. Must be in the form of /regex/flags',
    });

    return val;
  }

  try {
    const pattern = matched[1];
    const flags = matched[2];

    if (typeof pattern !== 'string' || typeof flags !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid regex format. Must be in the form of /regex/flags',
      });

      return val;
    }

    new RegExp(pattern, flags);

    return val;
  } catch (err) {
    if (err instanceof Error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err.message,
      });
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Unknown error',
      });
    }

    return val;
  }
}, z.string());

export type RegExpType = z.infer<typeof RegExpType>;


export const RegexFilter = z.object({
  id: z.number().int().positive(),
  regex: RegExpType,
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
