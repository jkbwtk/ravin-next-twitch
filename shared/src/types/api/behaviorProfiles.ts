import { z } from 'zod';
import { RegExpLiteralType } from '../regExp';
import { CommandTimerApi, CustomCommandApi } from './commands';
import { PhraseFilterApi, RegexFilterApi } from './filters';
import { PaginatedResponse } from '../pagination';
import { createSelectSchema } from 'drizzle-zod';
import { behaviorProfilesTable } from '../../schema/schema';


export const BehaviorProfileApi = createSelectSchema(behaviorProfilesTable, {
  id: (schema) => schema.id.int().positive(),
  name: (schema) => schema.name.min(3).max(32),
  enabled: (schema) => schema.enabled.default(true),
  description: (schema) => schema.description.min(3).max(255).optional().nullable().default(null),
  activatorCategory: () => RegExpLiteralType.optional().nullable().default(null),
  activatorTitle: () => RegExpLiteralType.optional().nullable().default(null),
}).pick({
  id: true,
  name: true,
  enabled: true,
  description: true,
  activatorCategory: true,
  activatorTitle: true,
}).merge(z.object({
  commands: z.array(CustomCommandApi),
  phraseFilters: z.array(PhraseFilterApi),
  regexFilters: z.array(RegexFilterApi),
  commandTimers: z.array(CommandTimerApi),
}));

export type BehaviorProfileApi = z.infer<typeof BehaviorProfileApi>;


export const GetBehaviorProfilesResponse = z.object({
  data: z.array(BehaviorProfileApi),
});

export type GetBehaviorProfilesResponse = z.infer<typeof GetBehaviorProfilesResponse>;


export const GetBehaviorProfilesPaginatedResponse = PaginatedResponse(GetBehaviorProfilesResponse);

export type GetBehaviorProfilesPaginatedResponse = z.infer<typeof GetBehaviorProfilesPaginatedResponse>;


export const PostBehaviorProfileReqBody = BehaviorProfileApi.omit({ id: true, commands: true, phraseFilters: true, regexFilters: true, commandTimers: true })
  .merge(z.object({
    commands: z.array(z.number().int().positive()),
    phraseFilters: z.array(z.number().int().positive()),
    regexFilters: z.array(z.number().int().positive()),
    commandTimers: z.array(z.number().int().positive()),
  }));

export type PostBehaviorProfileReqBody = z.infer<typeof PostBehaviorProfileReqBody>;


export const PatchBehaviorProfileReqBody = PostBehaviorProfileReqBody.partial();

export type PatchBehaviorProfileReqBody = z.infer<typeof PatchBehaviorProfileReqBody>;


export const BehaviorProfilesStatus = z.object({
  channelInformation: z.object({
    title: z.string().min(1).max(255),
    game_name: z.string().min(1).max(255),
    game_id: z.string().min(1).max(255),
    tags: z.array(z.string().min(1).max(255)),
  }).nullable().optional().default(null),
  streamStatus: z.object({
    viewer_count: z.number().int().positive(),
    started_at: z.string().min(1).max(255),
    language: z.string().min(1).max(255),
    thumbnail_url: z.string().min(1).max(255),
  }).nullable().optional().default(null),
  activeProfiles: z.array(BehaviorProfileApi),
});

export type BehaviorProfilesStatus = z.infer<typeof BehaviorProfilesStatus>;

export const GetBehaviorProfilesStatusResponse = z.object({
  data: BehaviorProfilesStatus,
});

export type GetBehaviorProfilesStatusResponse = z.infer<typeof GetBehaviorProfilesStatusResponse>;
