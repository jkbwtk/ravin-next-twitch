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
import { InferCreate, InferDelete, InferUpdate, StripUtilityRows } from './utils';


export type Config = typeof configTable.$inferSelect;

export type ConfigInsert = StripUtilityRows<typeof configTable.$inferInsert>;

export type ConfigCreate = InferCreate<ConfigInsert>;

export type ConfigUpdate = ConfigInsert;

export type ConfigDelete = Pick<Config, 'key'>;


export type Channel = typeof channelsTable.$inferSelect;

export type ChannelWithUser = Channel & {
  user: User;
};

export type ChannelInsert = StripUtilityRows<typeof channelsTable.$inferInsert>;

export type ChannelCreate = InferCreate<ChannelInsert>;

export type ChannelUpdate = InferUpdate<ChannelInsert>;

export type ChannelDelete = InferDelete<ChannelInsert>;


export type ChannelAction = typeof channelActionsTable.$inferSelect;

export type ChannelActionInsert = StripUtilityRows<typeof channelActionsTable.$inferInsert>;

export type ChannelActionCreate = InferCreate<ChannelActionInsert>;

export type ChannelActionUpdate = InferUpdate<ChannelActionInsert>;

export type ChannelActionDelete = InferDelete<ChannelActionInsert>;


export type ChannelStat = typeof channelStatsTable.$inferSelect;

export type ChannelStatInsert = StripUtilityRows<typeof channelStatsTable.$inferInsert>;

export type ChannelStatCreate = InferCreate<ChannelStatInsert>;

export type ChannelStatUpdate = InferUpdate<ChannelStatInsert>;

export type ChannelStatDelete = InferDelete<ChannelStatInsert>;


export type Command = typeof commandsTable.$inferSelect;

export type CommandWithUserAndTemplate = Command & {
  user: User;
  template: Template;
};

export type CommandInsert = StripUtilityRows<typeof commandsTable.$inferInsert>;

export type CommandCreate = InferCreate<CommandInsert>;

export type CommandUpdate = InferUpdate<CommandInsert>;

export type CommandDelete = InferDelete<CommandInsert>;


export type Message = typeof messagesTable.$inferSelect;

export type MessageInsert = StripUtilityRows<typeof messagesTable.$inferInsert>;

export type MessageCreate = InferCreate<MessageInsert>;

export type MessageUpdate = InferUpdate<MessageInsert>;

export type MessageDelete = InferDelete<MessageInsert>;


export type Token = typeof tokensTable.$inferSelect;

export type TokenInsert = StripUtilityRows<typeof tokensTable.$inferInsert>;

export type TokenCreate = InferCreate<TokenInsert>;

export type TokenUpdate = InferUpdate<TokenInsert>;

export type TokenDelete = InferDelete<TokenInsert>;


export type User = typeof usersTable.$inferSelect;

export type UserInsert = StripUtilityRows<typeof usersTable.$inferInsert>;

export type UserCreate = InferCreate<UserInsert>;

export type UserUpdate = InferUpdate<UserInsert>;

export type UserDelete = InferDelete<UserInsert>;


export type SystemNotification = typeof systemNotificationsTable.$inferSelect;

export type SystemNotificationInsert = StripUtilityRows<typeof systemNotificationsTable.$inferInsert>;

export type SystemNotificationCreate = InferCreate<SystemNotificationInsert>;

export type SystemNotificationUpdate = InferUpdate<SystemNotificationInsert>;

export type SystemNotificationDelete = InferDelete<SystemNotificationInsert>;


export type Template = typeof templatesTable.$inferSelect;

export type TemplateInsert = StripUtilityRows<typeof templatesTable.$inferInsert>;

export type TemplateCreate = InferCreate<TemplateInsert>;

export type TemplateUpdate = InferUpdate<TemplateInsert>;

export type TemplateDelete = InferDelete<TemplateInsert>;


export type CommandTimer = typeof commandTimersTable.$inferSelect;

export type CommandTimerWithUserAndTemplate = CommandTimer & {
  user: User;
  template: Template;
};

export type CommandTimerInsert = StripUtilityRows<typeof commandTimersTable.$inferInsert>;

export type CommandTimerCreate = InferCreate<CommandTimerInsert>;

export type CommandTimerUpdate = InferUpdate<CommandTimerInsert>;

export type CommandTimerDelete = InferDelete<CommandTimerInsert>;


export type BehaviorProfile = typeof behaviorProfilesTable.$inferSelect;

export type BehaviorProfileInsert = StripUtilityRows<typeof behaviorProfilesTable.$inferInsert>;

export type BehaviorProfileCreate = InferCreate<BehaviorProfileInsert>;

export type BehaviorProfileUpdate = InferUpdate<BehaviorProfileInsert>;

export type BehaviorProfileDelete = InferDelete<BehaviorProfileInsert>;


export type BotAction = typeof botActionsTable.$inferSelect;

export type BotActionInsert = StripUtilityRows<typeof botActionsTable.$inferInsert>;

export type BotActionCreate = InferCreate<BotActionInsert>;

export type BotActionUpdate = InferUpdate<BotActionInsert>;

export type BotActionDelete = InferDelete<BotActionInsert>;


export type PhraseFilter = typeof phraseFiltersTable.$inferSelect;

export type PhraseFilterInsert = StripUtilityRows<typeof phraseFiltersTable.$inferInsert>;

export type PhraseFilterCreate = InferCreate<PhraseFilterInsert>;

export type PhraseFilterUpdate = InferUpdate<PhraseFilterInsert>;

export type PhraseFilterDelete = InferDelete<PhraseFilterInsert>;


export type RegexFilter = typeof regexFiltersTable.$inferSelect;

export type RegexFilterInsert = StripUtilityRows<typeof regexFiltersTable.$inferInsert>;

export type RegexFilterCreate = InferCreate<RegexFilterInsert>;

export type RegexFilterUpdate = InferUpdate<RegexFilterInsert>;

export type RegexFilterDelete = InferDelete<RegexFilterInsert>;
