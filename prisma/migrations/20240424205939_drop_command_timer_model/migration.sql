/*
  Warnings:

  - You are about to drop the `CommandTimer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CommandTimer" DROP CONSTRAINT "CommandTimer_channelUserId_fkey";

-- DropTable
DROP TABLE "CommandTimer";
