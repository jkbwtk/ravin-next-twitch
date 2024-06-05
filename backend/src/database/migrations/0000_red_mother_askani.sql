DO $$ BEGIN
 CREATE TYPE "public"."ChannelActionType" AS ENUM('ban', 'timeout', 'delete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BehaviorProfile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" char(32) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"description" text,
	"activatorCategory" text,
	"activatorTitle" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"channelUserId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BotAction" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" json DEFAULT '[]'::json NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"channelUserId" varchar NOT NULL,
	"type" integer DEFAULT -1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Channel" (
	"id" serial PRIMARY KEY NOT NULL,
	"joined" boolean DEFAULT false NOT NULL,
	"chantingSettings" json DEFAULT '{"enabled":false,"interval":60,"length":3}'::json NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"userId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ChannelAction" (
	"id" serial PRIMARY KEY NOT NULL,
	"issuerDisplayName" varchar NOT NULL,
	"targetDisplayName" varchar NOT NULL,
	"type" "ChannelActionType" NOT NULL,
	"data" varchar NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"channelUserId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ChannelStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"frameId" integer NOT NULL,
	"messages" integer DEFAULT 0 NOT NULL,
	"timeouts" integer DEFAULT 0 NOT NULL,
	"bans" integer DEFAULT 0 NOT NULL,
	"deleted" integer DEFAULT 0 NOT NULL,
	"commands" integer DEFAULT 0 NOT NULL,
	"frameDuration" integer DEFAULT 60000 NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"userId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Command" (
	"id" serial PRIMARY KEY NOT NULL,
	"command" varchar NOT NULL,
	"userLevel" integer DEFAULT 0 NOT NULL,
	"cooldown" integer DEFAULT 10 NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"usage" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"channelUserId" varchar NOT NULL,
	"templateId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CommandTimer" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"alias" varchar NOT NULL,
	"cooldown" integer DEFAULT 60 NOT NULL,
	"cron" varchar NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"lines" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"channelUserId" varchar NOT NULL,
	"templateId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Config" (
	"key" varchar(32) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Message" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"channelName" varchar NOT NULL,
	"username" varchar NOT NULL,
	"displayName" varchar NOT NULL,
	"color" varchar,
	"userId" varchar NOT NULL,
	"content" varchar NOT NULL,
	"emotes" jsonb,
	"timestamp" timestamp(3) NOT NULL,
	"badgeInfo" jsonb,
	"badges" jsonb,
	"flags" varchar,
	"messageType" varchar NOT NULL,
	"firstMessage" boolean NOT NULL,
	"mod" boolean NOT NULL,
	"subscriber" boolean NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"channelUserId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PhraseFilter" (
	"id" serial PRIMARY KEY NOT NULL,
	"phrase" varchar NOT NULL,
	"caseSensitive" boolean DEFAULT false NOT NULL,
	"similarity" integer DEFAULT 0 NOT NULL,
	"action" integer DEFAULT 0 NOT NULL,
	"reason" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"actionDuration" integer DEFAULT 10 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"ignoreWhitespace" boolean DEFAULT false NOT NULL,
	"channelUserId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RegexFilter" (
	"id" serial PRIMARY KEY NOT NULL,
	"regex" varchar NOT NULL,
	"action" integer DEFAULT 0 NOT NULL,
	"reason" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"actionDuration" integer DEFAULT 10 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"channelUserId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SystemNotification" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"content" varchar NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"userId" varchar NOT NULL,
	"readAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Template" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"template" varchar NOT NULL,
	"states" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"userId" varchar NOT NULL,
	"environments" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Token" (
	"id" serial PRIMARY KEY NOT NULL,
	"accessToken" varchar NOT NULL,
	"refreshToken" varchar,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"userId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" varchar PRIMARY KEY NOT NULL,
	"login" varchar NOT NULL,
	"displayName" varchar NOT NULL,
	"email" varchar,
	"profileImageUrl" varchar NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"admin" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_BehaviorProfileToCommand" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_BehaviorProfileToCommandTimer" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_BehaviorProfileToPhraseFilter" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_BehaviorProfileToRegexFilter" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfile" ADD CONSTRAINT "BehaviorProfile_channelUserId_User_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BotAction" ADD CONSTRAINT "BotAction_channelUserId_User_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChannelAction" ADD CONSTRAINT "ChannelAction_channelUserId_User_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChannelStats" ADD CONSTRAINT "ChannelStats_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Command" ADD CONSTRAINT "Command_channelUserId_User_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Command" ADD CONSTRAINT "Command_templateId_Template_id_fk" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CommandTimer" ADD CONSTRAINT "CommandTimer_channelUserId_User_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CommandTimer" ADD CONSTRAINT "CommandTimer_templateId_Template_id_fk" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message" ADD CONSTRAINT "Message_channelUserId_User_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PhraseFilter" ADD CONSTRAINT "PhraseFilter_channelUserId_User_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RegexFilter" ADD CONSTRAINT "RegexFilter_channelUserId_User_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SystemNotification" ADD CONSTRAINT "SystemNotification_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BehaviorProfileToCommand" ADD CONSTRAINT "_BehaviorProfileToCommand_A_BehaviorProfile_id_fk" FOREIGN KEY ("A") REFERENCES "public"."BehaviorProfile"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BehaviorProfileToCommand" ADD CONSTRAINT "_BehaviorProfileToCommand_B_Command_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Command"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BehaviorProfileToCommandTimer" ADD CONSTRAINT "_BehaviorProfileToCommandTimer_A_BehaviorProfile_id_fk" FOREIGN KEY ("A") REFERENCES "public"."BehaviorProfile"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BehaviorProfileToCommandTimer" ADD CONSTRAINT "_BehaviorProfileToCommandTimer_B_CommandTimer_id_fk" FOREIGN KEY ("B") REFERENCES "public"."CommandTimer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BehaviorProfileToPhraseFilter" ADD CONSTRAINT "_BehaviorProfileToPhraseFilter_A_BehaviorProfile_id_fk" FOREIGN KEY ("A") REFERENCES "public"."BehaviorProfile"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BehaviorProfileToPhraseFilter" ADD CONSTRAINT "_BehaviorProfileToPhraseFilter_B_PhraseFilter_id_fk" FOREIGN KEY ("B") REFERENCES "public"."PhraseFilter"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BehaviorProfileToRegexFilter" ADD CONSTRAINT "_BehaviorProfileToRegexFilter_A_BehaviorProfile_id_fk" FOREIGN KEY ("A") REFERENCES "public"."BehaviorProfile"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BehaviorProfileToRegexFilter" ADD CONSTRAINT "_BehaviorProfileToRegexFilter_B_RegexFilter_id_fk" FOREIGN KEY ("B") REFERENCES "public"."RegexFilter"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfile_channelUserId_idx" ON "BehaviorProfile" USING btree ("channelUserId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "BehaviorProfile_channelUserId_name_key" ON "BehaviorProfile" USING btree ("channelUserId","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BotAction_channelUserId_idx" ON "BotAction" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Channel_userId_idx" ON "Channel" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Channel_userId_key" ON "Channel" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ChannelAction_channelUserId_idx" ON "ChannelAction" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ChannelAction_issuerDisplayName_idx" ON "ChannelAction" USING btree ("issuerDisplayName");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ChannelAction_targetDisplayName_idx" ON "ChannelAction" USING btree ("targetDisplayName");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ChannelAction_type_idx" ON "ChannelAction" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ChannelStats_frameId_idx" ON "ChannelStats" USING btree ("frameId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ChannelStats_userId_frameId_key" ON "ChannelStats" USING btree ("userId","frameId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ChannelStats_userId_idx" ON "ChannelStats" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Command_channelUserId_command_key" ON "Command" USING btree ("channelUserId","command");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Command_channelUserId_idx" ON "Command" USING btree ("channelUserId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "CommandTimer_channelUserId_alias_key" ON "CommandTimer" USING btree ("channelUserId","alias");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "CommandTimer_channelUserId_idx" ON "CommandTimer" USING btree ("channelUserId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "CommandTimer_channelUserId_name_key" ON "CommandTimer" USING btree ("channelUserId","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Message_channelName_idx" ON "Message" USING btree ("channelName");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Message_channelUserId_idx" ON "Message" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Message_userId_idx" ON "Message" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Message_username_idx" ON "Message" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Message_uuid_idx" ON "Message" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PhraseFilter_channelUserId_idx" ON "PhraseFilter" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "RegexFilter_channelUserId_idx" ON "RegexFilter" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "SystemNotification_userId_idx" ON "SystemNotification" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Template_userId_name_idx" ON "Template" USING btree ("userId","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Template_userId_name_key" ON "Template" USING btree ("userId","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Token_accessToken_key" ON "Token" USING btree ("accessToken");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Token_refreshToken_key" ON "Token" USING btree ("refreshToken");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Token_userId_idx" ON "Token" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Token_userId_key" ON "Token" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_displayName_key" ON "User" USING btree ("displayName");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "User_login_idx" ON "User" USING btree ("login");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_login_key" ON "User" USING btree ("login");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BehaviorProfileToCommand_AB_unique" ON "_BehaviorProfileToCommand" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_BehaviorProfileToCommand_B_index" ON "_BehaviorProfileToCommand" USING btree ("B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BehaviorProfileToCommandTimer_AB_unique" ON "_BehaviorProfileToCommandTimer" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_BehaviorProfileToCommandTimer_B_index" ON "_BehaviorProfileToCommandTimer" USING btree ("B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BehaviorProfileToPhraseFilter_AB_unique" ON "_BehaviorProfileToPhraseFilter" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_BehaviorProfileToPhraseFilter_B_index" ON "_BehaviorProfileToPhraseFilter" USING btree ("B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BehaviorProfileToRegexFilter_AB_unique" ON "_BehaviorProfileToRegexFilter" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_BehaviorProfileToRegexFilter_B_index" ON "_BehaviorProfileToRegexFilter" USING btree ("B");