/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `CommandTimer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,alias]` on the table `CommandTimer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CommandTimer" ADD COLUMN     "cooldown" INTEGER NOT NULL DEFAULT 60;

-- CreateIndex
CREATE UNIQUE INDEX "CommandTimer_userId_name_key" ON "CommandTimer"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CommandTimer_userId_alias_key" ON "CommandTimer"("userId", "alias");
