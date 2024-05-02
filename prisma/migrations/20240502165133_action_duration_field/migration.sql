-- AlterTable
ALTER TABLE "PhraseFilter" ADD COLUMN     "actionDuration" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "RegexFilter" ADD COLUMN     "actionDuration" INTEGER NOT NULL DEFAULT 10;
