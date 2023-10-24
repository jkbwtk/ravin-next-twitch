-- CreateTable
CREATE TABLE "Template" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "template" VARCHAR NOT NULL,
    "states" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Template_userId_name_idx" ON "Template"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Template_userId_name_key" ON "Template"("userId", "name");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
