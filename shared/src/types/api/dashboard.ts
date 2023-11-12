import { z } from 'zod';


export const Moderator = z.object({
  avatarUrl: z.string().url(),
  displayName: z.string().min(1),
  status: z.boolean(),
});

export type Moderator = z.infer<typeof Moderator>;


export const GetModeratorsResponse = z.object({
  data: z.array(Moderator),
});

export type GetModeratorsResponse = z.infer<typeof GetModeratorsResponse>;


export const BotConnectionStatus = z.object({
  channel: z.string().min(1),
  joined: z.boolean(),
  admin: z.boolean(),
});

export type BotConnectionStatus = z.infer<typeof BotConnectionStatus>;


export const GetBotConnectionStatusResponse = z.object({
  data: BotConnectionStatus,
});

export type GetBotConnectionStatusResponse = z.infer<typeof GetBotConnectionStatusResponse>;


// TODO make top stats optional
export const TopStats = z.object({
  chatter: z.object({
    avatarUrl: z.string().url(),
    displayName: z.string(),
  }),
  command: z.string(),
  emote: z.object({
    url: z.union([z.string().url(), z.string().max(0)]),
    name: z.string(),
  }),
});

export type TopStats = z.infer<typeof TopStats>;


export const GetTopStatsResponse = z.object({
  data: TopStats,
});

export type GetTopStatsResponse = z.infer<typeof GetTopStatsResponse>;


export const Action = z.union([
  z.object({
    date: z.number().int().positive(),
    issuerDisplayName: z.string().min(1),
    targetDisplayName: z.string().min(1),
    type: z.literal('ban'),
    reason: z.string().min(1),
  }),
  z.object({
    date: z.number().int().positive(),
    issuerDisplayName: z.string().min(1),
    targetDisplayName: z.string().min(1),
    type: z.literal('timeout'),
    duration: z.number().int().positive(),
  }),
  z.object({
    date: z.number().int().positive(),
    issuerDisplayName: z.string().min(1),
    targetDisplayName: z.string().min(1),
    type: z.literal('delete'),
    message: z.string().min(1),
  }),
]);

export type Action = z.infer<typeof Action>;


export const GetRecentActionsResponse = z.object({
  data: z.array(Action),
});

export type GetRecentActionsResponse = z.infer<typeof GetRecentActionsResponse>;


export const ChatStatSources = z.union([
  z.literal('messages'),
  z.literal('timeouts'),
  z.literal('bans'),
  z.literal('deleted'),
  z.literal('commands'),
]);

export type ChatStatSources = z.infer<typeof ChatStatSources>;


export const ChatStatFrame = z.object({
  timestamp: z.number().int().nonnegative(),
  frameDuration: z.number().int().positive(),
  messages: z.number().int().nonnegative(),
  timeouts: z.number().int().nonnegative(),
  bans: z.number().int().nonnegative(),
  deleted: z.number().int().nonnegative(),
  commands: z.number().int().nonnegative(),
}) satisfies z.Schema<{ [key in ChatStatSources]: number }>;

export type ChatStatFrame = z.infer<typeof ChatStatFrame>;


export const ChatStats = z.object({
  dateStart: z.number().int().nonnegative(),
  dateEnd: z.number().int().nonnegative(),

  frames: z.array(ChatStatFrame),

  messagesTotal: z.number().int().nonnegative(),
  timeoutsTotal: z.number().int().nonnegative(),
  bansTotal: z.number().int().nonnegative(),
  deletedTotal: z.number().int().nonnegative(),
  commandsTotal: z.number().int().nonnegative(),
}) satisfies z.Schema<{ [key in `${ChatStatSources}Total`]: number }>;

export type ChatStats = z.infer<typeof ChatStats>;


export const GetChatStatsResponse = z.object({
  data: ChatStats,
});

export type GetChatStatsResponse = z.infer<typeof GetChatStatsResponse>;
