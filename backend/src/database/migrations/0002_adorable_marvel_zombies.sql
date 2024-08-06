ALTER TABLE "BehaviorProfilesToCommandTimers" RENAME COLUMN "A" TO "behaviorProfileId";--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommandTimers" RENAME COLUMN "B" TO "commandTimerId";--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommands" RENAME COLUMN "A" TO "behaviorProfileId";--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommands" RENAME COLUMN "B" TO "commandId";--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToPhraseFilters" RENAME COLUMN "A" TO "behaviorProfileId";--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToPhraseFilters" RENAME COLUMN "B" TO "phraseFilterId";--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToRegexFilters" RENAME COLUMN "A" TO "behaviorProfileId";--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToRegexFilters" RENAME COLUMN "B" TO "regexFilterId";--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommandTimers" DROP CONSTRAINT "BehaviorProfilesToCommandTimers_A_BehaviorProfiles_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommandTimers" DROP CONSTRAINT "BehaviorProfilesToCommandTimers_B_CommandTimers_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommands" DROP CONSTRAINT "BehaviorProfilesToCommands_A_BehaviorProfiles_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToCommands" DROP CONSTRAINT "BehaviorProfilesToCommands_B_Commands_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToPhraseFilters" DROP CONSTRAINT "BehaviorProfilesToPhraseFilters_A_BehaviorProfiles_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToPhraseFilters" DROP CONSTRAINT "BehaviorProfilesToPhraseFilters_B_PhraseFilters_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToRegexFilters" DROP CONSTRAINT "BehaviorProfilesToRegexFilters_A_BehaviorProfiles_id_fk";
--> statement-breakpoint
ALTER TABLE "BehaviorProfilesToRegexFilters" DROP CONSTRAINT "BehaviorProfilesToRegexFilters_B_RegexFilters_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "BehaviorProfilesToCommandTimers_B_index";--> statement-breakpoint
DROP INDEX IF EXISTS "BehaviorProfilesToCommands_B_index";--> statement-breakpoint
DROP INDEX IF EXISTS "BehaviorProfilesToPhraseFilters_B_index";--> statement-breakpoint
DROP INDEX IF EXISTS "BehaviorProfilesToRegexFilters_B_index";--> statement-breakpoint
DROP INDEX IF EXISTS "_BehaviorProfileToCommandTimer_AB_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "_BehaviorProfileToCommand_AB_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "_BehaviorProfileToPhraseFilter_AB_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "_BehaviorProfileToRegexFilter_AB_unique";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToCommandTimers" ADD CONSTRAINT "BehaviorProfilesToCommandTimers_behaviorProfileId_BehaviorProfiles_id_fk" FOREIGN KEY ("behaviorProfileId") REFERENCES "public"."BehaviorProfiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToCommandTimers" ADD CONSTRAINT "BehaviorProfilesToCommandTimers_commandTimerId_CommandTimers_id_fk" FOREIGN KEY ("commandTimerId") REFERENCES "public"."CommandTimers"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToCommands" ADD CONSTRAINT "BehaviorProfilesToCommands_behaviorProfileId_BehaviorProfiles_id_fk" FOREIGN KEY ("behaviorProfileId") REFERENCES "public"."BehaviorProfiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToCommands" ADD CONSTRAINT "BehaviorProfilesToCommands_commandId_Commands_id_fk" FOREIGN KEY ("commandId") REFERENCES "public"."Commands"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToPhraseFilters" ADD CONSTRAINT "BehaviorProfilesToPhraseFilters_behaviorProfileId_BehaviorProfiles_id_fk" FOREIGN KEY ("behaviorProfileId") REFERENCES "public"."BehaviorProfiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToPhraseFilters" ADD CONSTRAINT "BehaviorProfilesToPhraseFilters_phraseFilterId_PhraseFilters_id_fk" FOREIGN KEY ("phraseFilterId") REFERENCES "public"."PhraseFilters"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToRegexFilters" ADD CONSTRAINT "BehaviorProfilesToRegexFilters_behaviorProfileId_BehaviorProfiles_id_fk" FOREIGN KEY ("behaviorProfileId") REFERENCES "public"."BehaviorProfiles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BehaviorProfilesToRegexFilters" ADD CONSTRAINT "BehaviorProfilesToRegexFilters_regexFilterId_RegexFilters_id_fk" FOREIGN KEY ("regexFilterId") REFERENCES "public"."RegexFilters"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfilesToCommandTimers_commandTimerId_index" ON "BehaviorProfilesToCommandTimers" USING btree ("commandTimerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfilesToCommands_commandId_index" ON "BehaviorProfilesToCommands" USING btree ("commandId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfilesToPhraseFilters_phraseFilterId_index" ON "BehaviorProfilesToPhraseFilters" USING btree ("phraseFilterId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "BehaviorProfilesToRegexFilters_regexFilterId_index" ON "BehaviorProfilesToRegexFilters" USING btree ("regexFilterId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BehaviorProfileToCommandTimer_AB_unique" ON "BehaviorProfilesToCommandTimers" USING btree ("behaviorProfileId","commandTimerId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BehaviorProfileToCommand_AB_unique" ON "BehaviorProfilesToCommands" USING btree ("behaviorProfileId","commandId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BehaviorProfileToPhraseFilter_AB_unique" ON "BehaviorProfilesToPhraseFilters" USING btree ("behaviorProfileId","phraseFilterId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BehaviorProfileToRegexFilter_AB_unique" ON "BehaviorProfilesToRegexFilters" USING btree ("behaviorProfileId","regexFilterId");