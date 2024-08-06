ALTER TABLE "ChannelStats" RENAME COLUMN "userId" TO "channelUserId";--> statement-breakpoint
ALTER TABLE "Channels" RENAME COLUMN "userId" TO "channelUserId";--> statement-breakpoint
ALTER TABLE "SystemNotifications" RENAME COLUMN "userId" TO "channelUserId";--> statement-breakpoint
ALTER TABLE "Templates" RENAME COLUMN "userId" TO "channelUserId";--> statement-breakpoint
ALTER TABLE "Tokens" RENAME COLUMN "userId" TO "channelUserId";--> statement-breakpoint
ALTER TABLE "ChannelStats" DROP CONSTRAINT "ChannelStats_userId_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "Channels" DROP CONSTRAINT "Channels_userId_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "SystemNotifications" DROP CONSTRAINT "SystemNotifications_userId_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "Templates" DROP CONSTRAINT "Templates_userId_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "Tokens" DROP CONSTRAINT "Tokens_userId_Users_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "ChannelStats_userId_frameId_key";--> statement-breakpoint
DROP INDEX IF EXISTS "ChannelStats_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "Channel_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "Channel_userId_key";--> statement-breakpoint
DROP INDEX IF EXISTS "Message_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "SystemNotification_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "Template_userId_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "Template_userId_name_key";--> statement-breakpoint
DROP INDEX IF EXISTS "Token_userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "Token_userId_key";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChannelStats" ADD CONSTRAINT "ChannelStats_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Channels" ADD CONSTRAINT "Channels_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SystemNotifications" ADD CONSTRAINT "SystemNotifications_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Templates" ADD CONSTRAINT "Templates_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Tokens" ADD CONSTRAINT "Tokens_channelUserId_Users_id_fk" FOREIGN KEY ("channelUserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ChannelStats_userId_frameId_key" ON "ChannelStats" USING btree ("channelUserId","frameId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ChannelStats_userId_idx" ON "ChannelStats" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Channel_userId_idx" ON "Channels" USING btree ("channelUserId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Channel_userId_key" ON "Channels" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Message_userId_idx" ON "Messages" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "SystemNotification_userId_idx" ON "SystemNotifications" USING btree ("channelUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Template_userId_name_idx" ON "Templates" USING btree ("channelUserId","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Template_userId_name_key" ON "Templates" USING btree ("channelUserId","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Token_userId_idx" ON "Tokens" USING btree ("channelUserId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Token_userId_key" ON "Tokens" USING btree ("channelUserId");--> statement-breakpoint
ALTER TABLE "Messages" DROP COLUMN IF EXISTS "userId";