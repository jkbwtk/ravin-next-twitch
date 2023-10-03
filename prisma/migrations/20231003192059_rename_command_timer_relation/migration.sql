/*
  Warnings:

  - You are about to drop the column `userId` on the `CommandTimer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[channelUserId,name]` on the table `CommandTimer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channelUserId,alias]` on the table `CommandTimer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `channelUserId` to the `CommandTimer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CommandTimer" DROP CONSTRAINT "CommandTimer_userId_fkey";

-- DropIndex
DROP INDEX "CommandTimer_userId_alias_key";

-- DropIndex
DROP INDEX "CommandTimer_userId_idx";

-- DropIndex
DROP INDEX "CommandTimer_userId_name_key";

-- AlterTable
ALTER TABLE "CommandTimer" DROP COLUMN "userId",
ADD COLUMN     "channelUserId" VARCHAR NOT NULL;

-- CreateIndex
CREATE INDEX "CommandTimer_channelUserId_idx" ON "CommandTimer"("channelUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CommandTimer_channelUserId_name_key" ON "CommandTimer"("channelUserId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CommandTimer_channelUserId_alias_key" ON "CommandTimer"("channelUserId", "alias");

-- AddForeignKey
ALTER TABLE "CommandTimer" ADD CONSTRAINT "CommandTimer_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
