-- CreateTable
CREATE TABLE "CommandTimer" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "alias" VARCHAR NOT NULL,
    "response" VARCHAR NOT NULL,
    "cron" VARCHAR NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lines" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR NOT NULL,

    CONSTRAINT "CommandTimer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommandTimer_userId_idx" ON "CommandTimer"("userId");

-- AddForeignKey
ALTER TABLE "CommandTimer" ADD CONSTRAINT "CommandTimer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
