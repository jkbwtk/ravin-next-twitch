import { relations } from 'drizzle-orm/relations';
import {
  behaviorProfilesTable,
  behaviorProfilesToCommandsTable,
  behaviorProfilesToCommandTimersTable,
  behaviorProfilesToPhraseFiltersTable,
  behaviorProfilesToRegexFiltersTable,
  botActionsTable,
  channelActionsTable,
  channelsTable,
  channelStatsTable,
  commandsTable,
  commandTimersTable,
  messagesTable,
  phraseFiltersTable,
  regexFiltersTable,
  systemNotificationsTable,
  templatesTable,
  tokensTable,
  usersTable,
} from './schema';


export const channelsRelations = relations(channelsTable, ({ one }) => ({
  User: one(usersTable, {
    fields: [channelsTable.userId],
    references: [usersTable.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  Channels: many(channelsTable),
  ChannelActions: many(channelActionsTable),
  ChannelStats: many(channelStatsTable),
  Commands: many(commandsTable),
  Messages: many(messagesTable),
  Tokens: many(tokensTable),
  SystemNotifications: many(systemNotificationsTable),
  Templates: many(templatesTable),
  CommandTimers: many(commandTimersTable),
  BehaviorProfiles: many(behaviorProfilesTable),
  BotActions: many(botActionsTable),
  PhraseFilters: many(phraseFiltersTable),
  RegexFilters: many(regexFiltersTable),
}));

export const channelActionsRelations = relations(channelActionsTable, ({ one }) => ({
  User: one(usersTable, {
    fields: [channelActionsTable.channelUserId],
    references: [usersTable.id],
  }),
}));

export const channelStatsRelations = relations(channelStatsTable, ({ one }) => ({
  User: one(usersTable, {
    fields: [channelStatsTable.userId],
    references: [usersTable.id],
  }),
}));

export const commandsRelations = relations(commandsTable, ({ one, many }) => ({
  User: one(usersTable, {
    fields: [commandsTable.channelUserId],
    references: [usersTable.id],
  }),
  Template: one(templatesTable, {
    fields: [commandsTable.templateId],
    references: [templatesTable.id],
  }),
  _BehaviorProfileToCommands: many(behaviorProfilesToCommandsTable),
}));

export const templatesRelations = relations(templatesTable, ({ one, many }) => ({
  Commands: many(commandsTable),
  User: one(usersTable, {
    fields: [templatesTable.userId],
    references: [usersTable.id],
  }),
  CommandTimers: many(commandTimersTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  User: one(usersTable, {
    fields: [messagesTable.channelUserId],
    references: [usersTable.id],
  }),
}));

export const tokensRelations = relations(tokensTable, ({ one }) => ({
  User: one(usersTable, {
    fields: [tokensTable.userId],
    references: [usersTable.id],
  }),
}));

export const systemNotificationsRelations = relations(systemNotificationsTable, ({ one }) => ({
  User: one(usersTable, {
    fields: [systemNotificationsTable.userId],
    references: [usersTable.id],
  }),
}));

export const commandTimersRelations = relations(commandTimersTable, ({ one, many }) => ({
  User: one(usersTable, {
    fields: [commandTimersTable.channelUserId],
    references: [usersTable.id],
  }),
  Template: one(templatesTable, {
    fields: [commandTimersTable.templateId],
    references: [templatesTable.id],
  }),
  _BehaviorProfileToCommandTimers: many(behaviorProfilesToCommandTimersTable),
}));

export const behaviorProfilesRelations = relations(behaviorProfilesTable, ({ one, many }) => ({
  User: one(usersTable, {
    fields: [behaviorProfilesTable.channelUserId],
    references: [usersTable.id],
  }),
  _BehaviorProfileToCommands: many(behaviorProfilesToCommandsTable),
  _BehaviorProfileToPhraseFilters: many(behaviorProfilesToPhraseFiltersTable),
  _BehaviorProfileToRegexFilters: many(behaviorProfilesToRegexFiltersTable),
  _BehaviorProfileToCommandTimers: many(behaviorProfilesToCommandTimersTable),
}));

export const behaviorProfilesToCommandsRelations = relations(behaviorProfilesToCommandsTable, ({ one }) => ({
  BehaviorProfile: one(behaviorProfilesTable, {
    fields: [behaviorProfilesToCommandsTable.A],
    references: [behaviorProfilesTable.id],
  }),
  Command: one(commandsTable, {
    fields: [behaviorProfilesToCommandsTable.B],
    references: [commandsTable.id],
  }),
}));

export const behaviorProfilesToPhraseFiltersRelations = relations(behaviorProfilesToPhraseFiltersTable, ({ one }) => ({
  BehaviorProfile: one(behaviorProfilesTable, {
    fields: [behaviorProfilesToPhraseFiltersTable.A],
    references: [behaviorProfilesTable.id],
  }),
  PhraseFilter: one(phraseFiltersTable, {
    fields: [behaviorProfilesToPhraseFiltersTable.B],
    references: [phraseFiltersTable.id],
  }),
}));

export const phraseFiltersRelations = relations(phraseFiltersTable, ({ one, many }) => ({
  _BehaviorProfileToPhraseFilters: many(behaviorProfilesToPhraseFiltersTable),
  User: one(usersTable, {
    fields: [phraseFiltersTable.channelUserId],
    references: [usersTable.id],
  }),
}));

export const behaviorProfilesToRegexFiltersRelations = relations(behaviorProfilesToRegexFiltersTable, ({ one }) => ({
  BehaviorProfile: one(behaviorProfilesTable, {
    fields: [behaviorProfilesToRegexFiltersTable.A],
    references: [behaviorProfilesTable.id],
  }),
  RegexFilter: one(regexFiltersTable, {
    fields: [behaviorProfilesToRegexFiltersTable.B],
    references: [regexFiltersTable.id],
  }),
}));

export const regexFiltersRelations = relations(regexFiltersTable, ({ one, many }) => ({
  _BehaviorProfileToRegexFilters: many(behaviorProfilesToRegexFiltersTable),
  User: one(usersTable, {
    fields: [regexFiltersTable.channelUserId],
    references: [usersTable.id],
  }),
}));

export const behaviorProfilesToCommandTimersRelations = relations(behaviorProfilesToCommandTimersTable, ({ one }) => ({
  BehaviorProfile: one(behaviorProfilesTable, {
    fields: [behaviorProfilesToCommandTimersTable.A],
    references: [behaviorProfilesTable.id],
  }),
  CommandTimer: one(commandTimersTable, {
    fields: [behaviorProfilesToCommandTimersTable.B],
    references: [commandTimersTable.id],
  }),
}));

export const botActionsRelations = relations(botActionsTable, ({ one }) => ({
  User: one(usersTable, {
    fields: [botActionsTable.channelUserId],
    references: [usersTable.id],
  }),
}));
