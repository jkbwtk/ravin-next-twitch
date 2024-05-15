/*
  Warnings:

  - A unique constraint covering the columns `[channelUserId,name]` on the table `BehaviorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BehaviorProfile_channelUserId_name_key" ON "BehaviorProfile"("channelUserId", "name");
