-- AlterTable
ALTER TABLE "PhraseFilter" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RegexFilter" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;
