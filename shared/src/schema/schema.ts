import {
  boolean,
  char,
  foreignKey,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { BotActionData, ChantingSettings, EmotesUsed, StatesObject, TemplateEnvironments } from '../types/database/columns';
import { BadgeInfo, Badges, ChatUserstate } from 'tmi.js';


export const ChannelActionType = pgEnum('ChannelActionType', ['ban', 'timeout', 'delete']);


export const configTable = pgTable('Config', {
  key: varchar('key', { length: 32 }).primaryKey().notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


export const channelsTable = pgTable(
  'Channels',
  {
    id: serial('id').primaryKey().notNull(),
    joined: boolean('joined').default(false).notNull(),
    chantingSettings: json('chantingSettings').$type<ChantingSettings>().default({ enabled: false, interval: 60, length: 3 }).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      userId_idx: index('Channel_userId_idx').using('btree', table.userId),
      userId_key: uniqueIndex('Channel_userId_key').using('btree', table.userId),
    };
  },
);

export const channelActionsTable = pgTable(
  'ChannelActions',
  {
    id: serial('id').primaryKey().notNull(),
    issuerDisplayName: varchar('issuerDisplayName').notNull(),
    targetDisplayName: varchar('targetDisplayName').notNull(),
    type: ChannelActionType('type').notNull(),
    data: varchar('data').notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      channelUserId_idx: index('ChannelAction_channelUserId_idx').using('btree', table.channelUserId),
      issuerDisplayName_idx: index('ChannelAction_issuerDisplayName_idx').using('btree', table.issuerDisplayName),
      targetDisplayName_idx: index('ChannelAction_targetDisplayName_idx').using('btree', table.targetDisplayName),
      type_idx: index('ChannelAction_type_idx').using('btree', table.type),
    };
  },
);


export const channelStatsTable = pgTable(
  'ChannelStats',
  {
    id: serial('id').primaryKey().notNull(),
    frameId: integer('frameId').notNull(),
    messages: integer('messages').default(0).notNull(),
    timeouts: integer('timeouts').default(0).notNull(),
    bans: integer('bans').default(0).notNull(),
    deleted: integer('deleted').default(0).notNull(),
    commands: integer('commands').default(0).notNull(),
    frameDuration: integer('frameDuration').default(60000).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      frameId_idx: index('ChannelStats_frameId_idx').using('btree', table.frameId),
      userId_frameId_key: uniqueIndex('ChannelStats_userId_frameId_key').using('btree', table.channelUserId, table.frameId),
      userId_idx: index('ChannelStats_userId_idx').using('btree', table.channelUserId),
    };
  },
);


export const commandsTable = pgTable(
  'Commands',
  {
    id: serial('id').primaryKey().notNull(),
    command: varchar('command').notNull(),
    userLevel: integer('userLevel').default(0).notNull(),
    cooldown: integer('cooldown').default(10).notNull(),
    enabled: boolean('enabled').default(false).notNull(),
    usage: integer('usage').default(0).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    templateId: integer('templateId')
      .notNull()
      .references(() => templatesTable.id),
  },
  (table) => {
    return {
      channelUserId_command_key: uniqueIndex('Command_channelUserId_command_key').using('btree', table.channelUserId, table.command),
      channelUserId_idx: index('Command_channelUserId_idx').using('btree', table.channelUserId),
    };
  },
);


export const messagesTable = pgTable(
  'Messages',
  {
    id: serial('id').primaryKey().notNull(),
    uuid: uuid('uuid').notNull(),
    channelName: varchar('channelName').notNull(),
    username: varchar('username').notNull(),
    displayName: varchar('displayName').notNull(),
    color: varchar('color'),
    userId: varchar('channelUserId').notNull(),
    content: varchar('content').notNull(),
    emotes: jsonb('emotes').$type<EmotesUsed>(),
    timestamp: timestamp('timestamp', { precision: 3, mode: 'date' }).notNull(),
    badgeInfo: jsonb('badgeInfo').$type<BadgeInfo>(),
    badges: jsonb('badges').$type<Badges>(),
    flags: varchar('flags'),
    messageType: varchar('messageType').$type<Exclude<ChatUserstate['message-type'], undefined>>().notNull(),
    firstMessage: boolean('firstMessage').notNull(),
    mod: boolean('mod').notNull(),
    subscriber: boolean('subscriber').notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      channelName_idx: index('Message_channelName_idx').using('btree', table.channelName),
      channelUserId_idx: index('Message_channelUserId_idx').using('btree', table.channelUserId),
      userId_idx: index('Message_userId_idx').using('btree', table.userId),
      username_idx: index('Message_username_idx').using('btree', table.username),
      uuid_idx: index('Message_uuid_idx').using('btree', table.uuid),
    };
  },
);

export const tokensTable = pgTable(
  'Tokens',
  {
    id: serial('id').primaryKey().notNull(),
    accessToken: varchar('accessToken').notNull(),
    refreshToken: varchar('refreshToken'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      accessToken_key: uniqueIndex('Token_accessToken_key').using('btree', table.accessToken),
      refreshToken_key: uniqueIndex('Token_refreshToken_key').using('btree', table.refreshToken),
      userId_idx: index('Token_userId_idx').using('btree', table.channelUserId),
      userId_key: uniqueIndex('Token_userId_key').using('btree', table.channelUserId),
    };
  },
);


export const usersTable = pgTable(
  'Users',
  {
    id: varchar('id').primaryKey().notNull(),
    login: varchar('login').notNull(),
    displayName: varchar('displayName').notNull(),
    email: varchar('email'),
    profileImageUrl: varchar('profileImageUrl').notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    admin: boolean('admin').default(false).notNull(),
  },
  (table) => {
    return {
      displayName_key: uniqueIndex('User_displayName_key').using('btree', table.displayName),
      login_idx: index('User_login_idx').using('btree', table.login),
      login_key: uniqueIndex('User_login_key').using('btree', table.login),
    };
  },
);


export const systemNotificationsTable = pgTable(
  'SystemNotifications',
  {
    id: serial('id').primaryKey().notNull(),
    title: varchar('title').notNull(),
    content: varchar('content').notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    readAt: timestamp('readAt', { precision: 3, mode: 'date' }),
  },
  (table) => {
    return {
      userId_idx: index('SystemNotification_userId_idx').using('btree', table.channelUserId),
    };
  },
);

export const templatesTable = pgTable(
  'Templates',
  {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name').notNull(),
    template: varchar('template').notNull(),
    states: jsonb('states').$type<StatesObject>().default({}).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    environments: jsonb('environments').$type<TemplateEnvironments[]>().default([]).notNull(),
  },
  (table) => {
    return {
      userId_name_idx: index('Template_userId_name_idx').using('btree', table.channelUserId, table.name),
      userId_name_key: uniqueIndex('Template_userId_name_key').using('btree', table.channelUserId, table.name),
    };
  },
);


export const commandTimersTable = pgTable(
  'CommandTimers',
  {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name').notNull(),
    alias: varchar('alias').notNull(),
    cooldown: integer('cooldown').default(60).notNull(),
    cron: varchar('cron').notNull(),
    enabled: boolean('enabled').default(false).notNull(),
    lines: integer('lines').default(0).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    templateId: integer('templateId')
      .notNull()
      .references(() => templatesTable.id),
  },
  (table) => {
    return {
      channelUserId_alias_key: uniqueIndex('CommandTimer_channelUserId_alias_key').using('btree', table.channelUserId, table.alias),
      channelUserId_idx: index('CommandTimer_channelUserId_idx').using('btree', table.channelUserId),
      channelUserId_name_key: uniqueIndex('CommandTimer_channelUserId_name_key').using('btree', table.channelUserId, table.name),
    };
  },
);

export const behaviorProfilesTable = pgTable(
  'BehaviorProfiles',
  {
    id: serial('id').primaryKey().notNull(),
    name: char('name', { length: 32 }).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    description: text('description'),
    activatorCategory: text('activatorCategory'),
    activatorTitle: text('activatorTitle'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      channelUserId_idx: index('BehaviorProfile_channelUserId_idx').using('btree', table.channelUserId),
      channelUserId_name_key: uniqueIndex('BehaviorProfile_channelUserId_name_key').using('btree', table.channelUserId, table.name),
    };
  },
);

export const behaviorProfilesToCommandsTable = pgTable(
  'BehaviorProfilesToCommands',
  {
    behaviorProfileId: integer('behaviorProfileId')
      .notNull()
      .references(() => behaviorProfilesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    commandId: integer('commandId')
      .notNull()
      .references(() => commandsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => {
    return {
      AB_unique: uniqueIndex('_BehaviorProfileToCommand_AB_unique').using('btree', table.behaviorProfileId, table.commandId),
      B_idx: index().using('btree', table.commandId),
    };
  },
);

export const behaviorProfilesToPhraseFiltersTable = pgTable(
  'BehaviorProfilesToPhraseFilters',
  {
    behaviorProfileId: integer('behaviorProfileId')
      .notNull()
      .references(() => behaviorProfilesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    phraseFilterId: integer('phraseFilterId')
      .notNull()
      .references(() => phraseFiltersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => {
    return {
      AB_unique: uniqueIndex('_BehaviorProfileToPhraseFilter_AB_unique').using('btree', table.behaviorProfileId, table.phraseFilterId),
      B_idx: index().using('btree', table.phraseFilterId),
    };
  },
);

export const behaviorProfilesToRegexFiltersTable = pgTable(
  'BehaviorProfilesToRegexFilters',
  {
    behaviorProfileId: integer('behaviorProfileId')
      .notNull()
      .references(() => behaviorProfilesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    regexFilterId: integer('regexFilterId')
      .notNull()
      .references(() => regexFiltersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => {
    return {
      AB_unique: uniqueIndex('_BehaviorProfileToRegexFilter_AB_unique').using('btree', table.behaviorProfileId, table.regexFilterId),
      B_idx: index().using('btree', table.regexFilterId),
    };
  },
);

export const behaviorProfilesToCommandTimersTable = pgTable(
  'BehaviorProfilesToCommandTimers',
  {
    behaviorProfileId: integer('behaviorProfileId')
      .notNull()
      .references(() => behaviorProfilesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    commandTimerId: integer('commandTimerId')
      .notNull()
      .references(() => commandTimersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => {
    return {
      AB_unique: uniqueIndex('_BehaviorProfileToCommandTimer_AB_unique').using('btree', table.behaviorProfileId, table.commandTimerId),
      B_idx: index().using('btree', table.commandTimerId),
    };
  },
);

export const botActionsTable = pgTable(
  'BotActions',
  {
    id: serial('id').primaryKey().notNull(),
    data: json('data').$type<BotActionData>().default([]).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: integer('type').default(-1).notNull(),
  },
  (table) => {
    return {
      channelUserId_idx: index('BotAction_channelUserId_idx').using('btree', table.channelUserId),
    };
  },
);

export const phraseFiltersTable = pgTable(
  'PhraseFilters',
  {
    id: serial('id').primaryKey().notNull(),
    phrase: varchar('phrase').notNull(),
    caseSensitive: boolean('caseSensitive').default(false).notNull(),
    similarity: integer('similarity').default(0).notNull(),
    action: integer('action').default(0).notNull(),
    reason: text('reason'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    actionDuration: integer('actionDuration').default(10).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    ignoreWhitespace: boolean('ignoreWhitespace').default(false).notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      channelUserId_idx: index('PhraseFilter_channelUserId_idx').using('btree', table.channelUserId),
    };
  },
);


export const regexFiltersTable = pgTable(
  'RegexFilters',
  {
    id: serial('id').primaryKey().notNull(),
    regex: varchar('regex').notNull(),
    action: integer('action').default(0).notNull(),
    reason: text('reason'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    actionDuration: integer('actionDuration').default(10).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    channelUserId: varchar('channelUserId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      channelUserId_idx: index('RegexFilter_channelUserId_idx').using('btree', table.channelUserId),
    };
  },
);

