-- CreateTable
CREATE TABLE "CommandTimer" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "alias" VARCHAR NOT NULL,
    "cooldown" INTEGER NOT NULL DEFAULT 60,
    "cron" VARCHAR NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lines" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelUserId" VARCHAR NOT NULL,
    "templateId" INTEGER NOT NULL,

    CONSTRAINT "CommandTimer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommandTimer_channelUserId_idx" ON "CommandTimer"("channelUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CommandTimer_channelUserId_name_key" ON "CommandTimer"("channelUserId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CommandTimer_channelUserId_alias_key" ON "CommandTimer"("channelUserId", "alias");

-- AddForeignKey
ALTER TABLE "CommandTimer" ADD CONSTRAINT "CommandTimer_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CommandTimer" ADD CONSTRAINT "CommandTimer_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
