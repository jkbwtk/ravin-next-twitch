-- CreateTable
CREATE TABLE "BehaviorProfile" (
    "id" SERIAL NOT NULL,
    "name" CHAR(32) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR NOT NULL,
    "activatorCategory" VARCHAR,
    "activatorTitle" VARCHAR,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelUserId" VARCHAR NOT NULL,

    CONSTRAINT "BehaviorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BehaviorProfileToCommand" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BehaviorProfileToPhraseFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BehaviorProfileToRegexFilter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BehaviorProfileToCommandTimer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "BehaviorProfile_channelUserId_idx" ON "BehaviorProfile"("channelUserId");

-- CreateIndex
CREATE UNIQUE INDEX "_BehaviorProfileToCommand_AB_unique" ON "_BehaviorProfileToCommand"("A", "B");

-- CreateIndex
CREATE INDEX "_BehaviorProfileToCommand_B_index" ON "_BehaviorProfileToCommand"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BehaviorProfileToPhraseFilter_AB_unique" ON "_BehaviorProfileToPhraseFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_BehaviorProfileToPhraseFilter_B_index" ON "_BehaviorProfileToPhraseFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BehaviorProfileToRegexFilter_AB_unique" ON "_BehaviorProfileToRegexFilter"("A", "B");

-- CreateIndex
CREATE INDEX "_BehaviorProfileToRegexFilter_B_index" ON "_BehaviorProfileToRegexFilter"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BehaviorProfileToCommandTimer_AB_unique" ON "_BehaviorProfileToCommandTimer"("A", "B");

-- CreateIndex
CREATE INDEX "_BehaviorProfileToCommandTimer_B_index" ON "_BehaviorProfileToCommandTimer"("B");

-- AddForeignKey
ALTER TABLE "BehaviorProfile" ADD CONSTRAINT "BehaviorProfile_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_BehaviorProfileToCommand" ADD CONSTRAINT "_BehaviorProfileToCommand_A_fkey" FOREIGN KEY ("A") REFERENCES "BehaviorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BehaviorProfileToCommand" ADD CONSTRAINT "_BehaviorProfileToCommand_B_fkey" FOREIGN KEY ("B") REFERENCES "Command"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BehaviorProfileToPhraseFilter" ADD CONSTRAINT "_BehaviorProfileToPhraseFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "BehaviorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BehaviorProfileToPhraseFilter" ADD CONSTRAINT "_BehaviorProfileToPhraseFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "PhraseFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BehaviorProfileToRegexFilter" ADD CONSTRAINT "_BehaviorProfileToRegexFilter_A_fkey" FOREIGN KEY ("A") REFERENCES "BehaviorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BehaviorProfileToRegexFilter" ADD CONSTRAINT "_BehaviorProfileToRegexFilter_B_fkey" FOREIGN KEY ("B") REFERENCES "RegexFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BehaviorProfileToCommandTimer" ADD CONSTRAINT "_BehaviorProfileToCommandTimer_A_fkey" FOREIGN KEY ("A") REFERENCES "BehaviorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BehaviorProfileToCommandTimer" ADD CONSTRAINT "_BehaviorProfileToCommandTimer_B_fkey" FOREIGN KEY ("B") REFERENCES "CommandTimer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
