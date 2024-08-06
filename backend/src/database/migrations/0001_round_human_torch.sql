DROP TABLE "_prisma_migrations";--> statement-breakpoint
ALTER TABLE "BehaviorProfile" RENAME TO "BehaviorProfiles";--> statement-breakpoint
ALTER TABLE "_BehaviorProfileToCommandTimer" RENAME TO "BehaviorProfilesToCommandTimers";--> statement-breakpoint
ALTER TABLE "_BehaviorProfileToCommand" RENAME TO "BehaviorProfilesToCommands";--> statement-breakpoint
ALTER TABLE "_BehaviorProfileToPhraseFilter" RENAME TO "BehaviorProfilesToPhraseFilters";--> statement-breakpoint
ALTER TABLE "_BehaviorProfileToRegexFilter" RENAME TO "BehaviorProfilesToRegexFilters";--> statement-breakpoint
ALTER TABLE "BotAction" RENAME TO "BotActions";--> statement-breakpoint
ALTER TABLE "ChannelAction" RENAME TO "ChannelActions";--> statement-breakpoint
ALTER TABLE "Channel" RENAME TO "Channels";--> statement-breakpoint
ALTER TABLE "CommandTimer" RENAME TO "CommandTimers";--> statement-breakpoint
ALTER TABLE "Command" RENAME TO "Commands";--> statement-breakpoint
ALTER TABLE "Message" RENAME TO "Messages";--> statement-breakpoint
ALTER TABLE "PhraseFilter" RENAME TO "PhraseFilters";--> statement-breakpoint
ALTER TABLE "RegexFilter" RENAME TO "RegexFilters";--> statement-breakpoint
ALTER TABLE "SystemNotification" RENAME TO "SystemNotifications";--> statement-breakpoint
ALTER TABLE "Template" RENAME TO "Templates";--> statement-breakpoint
ALTER TABLE "Token" RENAME TO "Tokens";--> statement-breakpoint
ALTER TABLE "User" RENAME TO "Users";--> statement-breakpoint
ALTER TABLE "BehaviorProfiles" DROP CONSTRAINT "BehaviorProfile_channelUserId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "BotActions" DROP CONSTRAINT "BotAction_channelUserId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Channels" DROP CONSTRAINT "Channel_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "ChannelActions" DROP CONSTRAINT "ChannelAction_channelUserId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "ChannelStats" DROP CONSTRAINT "ChannelStats_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Commands" DROP CONSTRAINT "Command_channelUserId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Commands" DROP CONSTRAINT "Command_templateId_Template_id_fk";
--> statement-breakpoint
ALTER TABLE "CommandTimers" DROP CONSTRAINT "CommandTimer_channelUserId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "CommandTimers" DROP CONSTRAINT "CommandTimer_templateId_Template_id_fk";
--> statement-breakpoint
ALTER TABLE "Messages" DROP CONSTRAINT "Message_channelUserId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "PhraseFilters" DROP CONSTRAINT "PhraseFilter_channelUserId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "RegexFilters" DROP CONSTRAINT "RegexFilter_channelUserId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "SystemNotifications" DROP CONSTRAINT "SystemNotification_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Templates" DROP CONSTRAINT "Template_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Tokens" DROP CONSTRAINT "Token_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommands" DROP CONSTRAINT "_BehaviorProfileToCommand_A_BehaviorProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommands" DROP CONSTRAINT "_BehaviorProfileToCommand_B_Command_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommandTimers" DROP CONSTRAINT "_BehaviorProfileToCommandTimer_A_BehaviorProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommandTimers" DROP CONSTRAINT "_BehaviorProfileToCommandTimer_B_CommandTimer_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToPhraseFilters" DROP CONSTRAINT "_BehaviorProfileToPhraseFilter_A_BehaviorProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToPhraseFilters" DROP CONSTRAINT "_BehaviorProfileToPhraseFilter_B_PhraseFilter_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToRegexFilters" DROP CONSTRAINT "_BehaviorProfileToRegexFilter_A_BehaviorProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToRegexFilters" DROP CONSTRAINT "_BehaviorProfileToRegexFilter_B_RegexFilter_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "_BehaviorProfileToCommand_B_index";--> statement-breakpoint
DROP INDEX IF EXISTS "_BehaviorProfileToCommandTimer_B_index";--> statement-breakpoint
DROP INDEX IF EXISTS "_BehaviorProfileToPhraseFilter_B_index";--> statement-breakpoint
DROP INDEX IF EXISTS "_BehaviorProfileToRegexFilter_B_index";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfiles" ADD CONSTRAINT "BehaviorProfiles_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BotActions" ADD CONSTRAINT "BotActions_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Channels" ADD CONSTRAINT "Channels_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChannelActions" ADD CONSTRAINT "ChannelActions_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChannelStats" ADD CONSTRAINT "ChannelStats_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Commands" ADD CONSTRAINT "Commands_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Commands" ADD CONSTRAINT "Commands_templateId_Templates_id_fk" FOREIGN KEY ("templateId") REFERENCES "public"."Templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CommandTimers" ADD CONSTRAINT "CommandTimers_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CommandTimers" ADD CONSTRAINT "CommandTimers_templateId_Templates_id_fk" FOREIGN KEY ("templateId") REFERENCES "public"."Templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Messages" ADD CONSTRAINT "Messages_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PhraseFilters" ADD CONSTRAINT "PhraseFilters_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RegexFilters" ADD CONSTRAINT "RegexFilters_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SystemNotifications" ADD CONSTRAINT "SystemNotifications_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Templates" ADD CONSTRAINT "Templates_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Tokens" ADD CONSTRAINT "Tokens_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToCommands" ADD CONSTRAINT "BehaviorProfilesToCommands_A_BehaviorProfiles_id_fk" FOREIGN KEY ("A") REFERENCES "public"."BehaviorProfiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToCommands" ADD CONSTRAINT "BehaviorProfilesToCommands_B_Commands_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Commands"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToCommandTimers" ADD CONSTRAINT "BehaviorProfilesToCommandTimers_A_BehaviorProfiles_id_fk" FOREIGN KEY ("A") REFERENCES "public"."BehaviorProfiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToCommandTimers" ADD CONSTRAINT "BehaviorProfilesToCommandTimers_B_CommandTimers_id_fk" FOREIGN KEY ("B") REFERENCES "public"."CommandTimers"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToPhraseFilters" ADD CONSTRAINT "BehaviorProfilesToPhraseFilters_A_BehaviorProfiles_id_fk" FOREIGN KEY ("A") REFERENCES "public"."BehaviorProfiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToPhraseFilters" ADD CONSTRAINT "BehaviorProfilesToPhraseFilters_B_PhraseFilters_id_fk" FOREIGN KEY ("B") REFERENCES "public"."PhraseFilters"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToRegexFilters" ADD CONSTRAINT "BehaviorProfilesToRegexFilters_A_BehaviorProfiles_id_fk" FOREIGN KEY ("A") REFERENCES "public"."BehaviorProfiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToRegexFilters" ADD CONSTRAINT "BehaviorProfilesToRegexFilters_B_RegexFilters_id_fk" FOREIGN KEY ("B") REFERENCES "public"."RegexFilters"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfilesToCommands_B_index" ON "BehaviorProfilesToCommands" USING btree ("B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfilesToCommandTimers_B_index" ON "BehaviorProfilesToCommandTimers" USING btree ("B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfilesToPhraseFilters_B_index" ON "BehaviorProfilesToPhraseFilters" USING btree ("B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfilesToRegexFilters_B_index" ON "BehaviorProfilesToRegexFilters" USING btree ("B");