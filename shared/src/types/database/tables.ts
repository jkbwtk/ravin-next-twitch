import {
  behaviorProfilesTable,
  botActionsTable,
  channelActionsTable,
  channelsTable,
  channelStatsTable,
  commandsTable,
  commandTimersTable,
  configTable,
  messagesTable,
  phraseFiltersTable,
  regexFiltersTable,
  systemNotificationsTable,
  templatesTable,
  tokensTable,
  usersTable,
} from '../../schema/schema';
import { StripUtilityRows } from './utils';


export type Config = typeof configTable.$inferSelect;

export type ConfigInsert = StripUtilityRows<typeof configTable.$inferInsert>;


export type Channel = typeof channelsTable.$inferSelect;

export type ChannelInsert = StripUtilityRows<typeof channelsTable.$inferInsert>;


export type ChannelAction = typeof channelActionsTable.$inferSelect;

export type ChannelActionInsert = StripUtilityRows<typeof channelActionsTable.$inferInsert>;


export type ChannelStat = typeof channelStatsTable.$inferSelect;

export type ChannelStatInsert = StripUtilityRows<typeof channelStatsTable.$inferInsert>;


export type Command = typeof commandsTable.$inferSelect;

export type CommandInsert = StripUtilityRows<typeof commandsTable.$inferInsert>;


export type Message = typeof messagesTable.$inferSelect;

export type MessageInsert = StripUtilityRows<typeof messagesTable.$inferInsert>;


export type Token = typeof tokensTable.$inferSelect;

export type TokenInsert = StripUtilityRows<typeof tokensTable.$inferInsert>;


export type User = typeof usersTable.$inferSelect;

export type UserInsert = StripUtilityRows<typeof usersTable.$inferInsert>;


export type SystemNotification = typeof systemNotificationsTable.$inferSelect;

export type SystemNotificationInsert = StripUtilityRows<typeof systemNotificationsTable.$inferInsert>;


export type Template = typeof templatesTable.$inferSelect;

export type TemplateInsert = StripUtilityRows<typeof templatesTable.$inferInsert>;


export type CommandTimer = typeof commandTimersTable.$inferSelect;

export type CommandTimerInsert = StripUtilityRows<typeof commandTimersTable.$inferInsert>;


export type BehaviorProfile = typeof behaviorProfilesTable.$inferSelect;

export type BehaviorProfileInsert = StripUtilityRows<typeof behaviorProfilesTable.$inferInsert>;


export type BotAction = typeof botActionsTable.$inferSelect;

export type BotActionInsert = StripUtilityRows<typeof botActionsTable.$inferInsert>;


export type PhraseFilter = typeof phraseFiltersTable.$inferSelect;

export type PhraseFilterInsert = StripUtilityRows<typeof phraseFiltersTable.$inferInsert>;


export type RegexFilter = typeof regexFiltersTable.$inferSelect;

export type RegexFilterInsert = StripUtilityRows<typeof regexFiltersTable.$inferInsert>;
