-- CreateTable
CREATE TABLE "PhraseFilter" (
    "id" SERIAL NOT NULL,
    "phrase" VARCHAR NOT NULL,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
    "similarity" INTEGER NOT NULL DEFAULT 0,
    "action" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chanelUserId" VARCHAR NOT NULL,

    CONSTRAINT "PhraseFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegexFilter" (
    "id" SERIAL NOT NULL,
    "regex" VARCHAR NOT NULL,
    "action" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chanelUserId" VARCHAR NOT NULL,

    CONSTRAINT "RegexFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhraseFilter_chanelUserId_idx" ON "PhraseFilter"("chanelUserId");

-- CreateIndex
CREATE INDEX "RegexFilter_chanelUserId_idx" ON "RegexFilter"("chanelUserId");

-- AddForeignKey
ALTER TABLE "PhraseFilter" ADD CONSTRAINT "PhraseFilter_chanelUserId_fkey" FOREIGN KEY ("chanelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RegexFilter" ADD CONSTRAINT "RegexFilter_chanelUserId_fkey" FOREIGN KEY ("chanelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
