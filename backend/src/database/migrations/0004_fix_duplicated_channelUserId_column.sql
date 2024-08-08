DROP INDEX IF EXISTS "Message_userId_idx";--> statement-breakpoint
ALTER TABLE "Messages" ADD COLUMN "userId" varchar NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Message_userId_idx" ON "Messages" USING btree ("userId");