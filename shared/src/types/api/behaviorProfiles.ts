import { z } from 'zod';
import { RegExpLiteralType } from '../regExp';
import { CommandTimer, CustomCommand } from './commands';
import { PhraseFilter, RegexFilter } from './filters';
import { PaginatedResponse } from '../pagination';


export const BehaviorProfile = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3).max(32),
  enabled: z.boolean().default(true),
  description: z.string().min(3).max(255).optional().nullable().default(null),
  activatorCategory: RegExpLiteralType.optional().nullable().default(null),
  activatorTitle: RegExpLiteralType.optional().nullable().default(null),

  commands: z.array(CustomCommand),
  phraseFilters: z.array(PhraseFilter),
  regexFilters: z.array(RegexFilter),
  commandTimers: z.array(CommandTimer),
});

export type BehaviorProfile = z.infer<typeof BehaviorProfile>;


export const GetBehaviorProfilesResponse = z.object({
  data: z.array(BehaviorProfile),
});

export type GetBehaviorProfilesResponse = z.infer<typeof GetBehaviorProfilesResponse>;


export const GetBehaviorProfilesPaginatedResponse = PaginatedResponse(GetBehaviorProfilesResponse);

export type GetBehaviorProfilesPaginatedResponse = z.infer<typeof GetBehaviorProfilesPaginatedResponse>;


export const PostBehaviorProfileReqBody = BehaviorProfile.omit({ id: true, commands: true, phraseFilters: true, regexFilters: true, commandTimers: true })
  .merge(z.object({
    commands: z.array(z.number().int().positive()),
    phraseFilters: z.array(z.number().int().positive()),
    regexFilters: z.array(z.number().int().positive()),
    commandTimers: z.array(z.number().int().positive()),
  }));

export type PostBehaviorProfileReqBody = z.infer<typeof PostBehaviorProfileReqBody>;


export const PatchBehaviorProfileReqBody = BehaviorProfile.pick({ id: true }).merge(PostBehaviorProfileReqBody.partial());

export type PatchBehaviorProfileReqBody = z.infer<typeof PatchBehaviorProfileReqBody>;


export const DeleteBehaviorProfileReqBody = BehaviorProfile.pick({ id: true });

export type DeleteBehaviorProfileReqBody = z.infer<typeof DeleteBehaviorProfileReqBody>;
