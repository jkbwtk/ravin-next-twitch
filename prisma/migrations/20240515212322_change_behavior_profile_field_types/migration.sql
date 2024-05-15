-- AlterTable
ALTER TABLE "BehaviorProfile" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "activatorCategory" SET DATA TYPE TEXT,
ALTER COLUMN "activatorTitle" SET DATA TYPE TEXT;
