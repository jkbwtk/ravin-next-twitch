/*
  Warnings:

  - You are about to drop the column `chanelUserId` on the `PhraseFilter` table. All the data in the column will be lost.
  - You are about to drop the column `chanelUserId` on the `RegexFilter` table. All the data in the column will be lost.
  - Added the required column `channelUserId` to the `PhraseFilter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channelUserId` to the `RegexFilter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PhraseFilter" DROP CONSTRAINT "PhraseFilter_chanelUserId_fkey";

-- DropForeignKey
ALTER TABLE "RegexFilter" DROP CONSTRAINT "RegexFilter_chanelUserId_fkey";

-- DropIndex
DROP INDEX "PhraseFilter_chanelUserId_idx";

-- DropIndex
DROP INDEX "RegexFilter_chanelUserId_idx";

-- AlterTable
ALTER TABLE "PhraseFilter" DROP COLUMN "chanelUserId",
ADD COLUMN     "channelUserId" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "RegexFilter" DROP COLUMN "chanelUserId",
ADD COLUMN     "channelUserId" VARCHAR NOT NULL;

-- CreateIndex
CREATE INDEX "PhraseFilter_channelUserId_idx" ON "PhraseFilter"("channelUserId");

-- CreateIndex
CREATE INDEX "RegexFilter_channelUserId_idx" ON "RegexFilter"("channelUserId");

-- AddForeignKey
ALTER TABLE "PhraseFilter" ADD CONSTRAINT "PhraseFilter_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RegexFilter" ADD CONSTRAINT "RegexFilter_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
