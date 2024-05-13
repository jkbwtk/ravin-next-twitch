-- CreateTable
CREATE TABLE "BotAction" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR NOT NULL,
    "data" JSON NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelUserId" VARCHAR NOT NULL,

    CONSTRAINT "BotAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotAction_channelUserId_idx" ON "BotAction"("channelUserId");

-- AddForeignKey
ALTER TABLE "BotAction" ADD CONSTRAINT "BotAction_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
