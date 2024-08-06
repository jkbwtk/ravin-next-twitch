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
  user: one(usersTable, {
    fields: [channelsTable.userId],
    references: [usersTable.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  channels: many(channelsTable),
  channelActions: many(channelActionsTable),
  channelStats: many(channelStatsTable),
  commands: many(commandsTable),
  messages: many(messagesTable),
  tokens: many(tokensTable),
  systemNotifications: many(systemNotificationsTable),
  templates: many(templatesTable),
  commandTimers: many(commandTimersTable),
  behaviorProfiles: many(behaviorProfilesTable),
  botActions: many(botActionsTable),
  phraseFilters: many(phraseFiltersTable),
  regexFilters: many(regexFiltersTable),
}));

export const channelActionsRelations = relations(channelActionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [channelActionsTable.channelUserId],
    references: [usersTable.id],
  }),
}));

export const channelStatsRelations = relations(channelStatsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [channelStatsTable.userId],
    references: [usersTable.id],
  }),
}));

export const commandsRelations = relations(commandsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [commandsTable.channelUserId],
    references: [usersTable.id],
  }),
  template: one(templatesTable, {
    fields: [commandsTable.templateId],
    references: [templatesTable.id],
  }),
  commands: many(behaviorProfilesToCommandsTable),
}));

export const templatesRelations = relations(templatesTable, ({ one, many }) => ({
  commands: many(commandsTable),
  user: one(usersTable, {
    fields: [templatesTable.userId],
    references: [usersTable.id],
  }),
  commandTimers: many(commandTimersTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [messagesTable.channelUserId],
    references: [usersTable.id],
  }),
}));

export const tokensRelations = relations(tokensTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [tokensTable.userId],
    references: [usersTable.id],
  }),
}));

export const systemNotificationsRelations = relations(systemNotificationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [systemNotificationsTable.userId],
    references: [usersTable.id],
  }),
}));

export const commandTimersRelations = relations(commandTimersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [commandTimersTable.channelUserId],
    references: [usersTable.id],
  }),
  template: one(templatesTable, {
    fields: [commandTimersTable.templateId],
    references: [templatesTable.id],
  }),
  commandTimers: many(behaviorProfilesToCommandTimersTable),
}));

export const behaviorProfilesRelations = relations(behaviorProfilesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [behaviorProfilesTable.channelUserId],
    references: [usersTable.id],
  }),
  commands: many(behaviorProfilesToCommandsTable),
  phraseFilters: many(behaviorProfilesToPhraseFiltersTable),
  regexFilters: many(behaviorProfilesToRegexFiltersTable),
  commandTimers: many(behaviorProfilesToCommandTimersTable),
}));

export const behaviorProfilesToCommandsRelations = relations(behaviorProfilesToCommandsTable, ({ one }) => ({
  behaviorProfile: one(behaviorProfilesTable, {
    fields: [behaviorProfilesToCommandsTable.behaviorProfileId],
    references: [behaviorProfilesTable.id],
  }),
  command: one(commandsTable, {
    fields: [behaviorProfilesToCommandsTable.commandId],
    references: [commandsTable.id],
  }),
}));

export const behaviorProfilesToPhraseFiltersRelations = relations(behaviorProfilesToPhraseFiltersTable, ({ one }) => ({
  behaviorProfile: one(behaviorProfilesTable, {
    fields: [behaviorProfilesToPhraseFiltersTable.behaviorProfileId],
    references: [behaviorProfilesTable.id],
  }),
  phraseFilter: one(phraseFiltersTable, {
    fields: [behaviorProfilesToPhraseFiltersTable.phraseFilterId],
    references: [phraseFiltersTable.id],
  }),
}));

export const phraseFiltersRelations = relations(phraseFiltersTable, ({ one, many }) => ({
  phraseFilters: many(behaviorProfilesToPhraseFiltersTable),
  user: one(usersTable, {
    fields: [phraseFiltersTable.channelUserId],
    references: [usersTable.id],
  }),
}));

export const behaviorProfilesToRegexFiltersRelations = relations(behaviorProfilesToRegexFiltersTable, ({ one }) => ({
  behaviorProfile: one(behaviorProfilesTable, {
    fields: [behaviorProfilesToRegexFiltersTable.behaviorProfileId],
    references: [behaviorProfilesTable.id],
  }),
  regexFilter: one(regexFiltersTable, {
    fields: [behaviorProfilesToRegexFiltersTable.regexFilterId],
    references: [regexFiltersTable.id],
  }),
}));

export const regexFiltersRelations = relations(regexFiltersTable, ({ one, many }) => ({
  regexFilters: many(behaviorProfilesToRegexFiltersTable),
  user: one(usersTable, {
    fields: [regexFiltersTable.channelUserId],
    references: [usersTable.id],
  }),
}));

export const behaviorProfilesToCommandTimersRelations = relations(behaviorProfilesToCommandTimersTable, ({ one }) => ({
  behaviorProfile: one(behaviorProfilesTable, {
    fields: [behaviorProfilesToCommandTimersTable.behaviorProfileId],
    references: [behaviorProfilesTable.id],
  }),
  commandTimer: one(commandTimersTable, {
    fields: [behaviorProfilesToCommandTimersTable.commandTimerId],
    references: [commandTimersTable.id],
  }),
}));

export const botActionsRelations = relations(botActionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [botActionsTable.channelUserId],
    references: [usersTable.id],
  }),
}));
