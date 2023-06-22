/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `ChannelAction` table. All the data in the column will be lost.
  - You are about to drop the column `destroyedAt` on the `Command` table. All the data in the column will be lost.
  - You are about to drop the column `destroyedAt` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `SystemNotification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChannelAction" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Command" DROP COLUMN "destroyedAt";

-- AlterTable
ALTER TABLE "Config" DROP COLUMN "destroyedAt";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "SystemNotification" DROP COLUMN "deletedAt",
ADD COLUMN     "readAt" TIMESTAMP(3);
