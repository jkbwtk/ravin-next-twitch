/*
  Warnings:

  - You are about to drop the column `response` on the `Command` table. All the data in the column will be lost.
  - Added the required column `templateId` to the `Command` table without a default value. This is not possible if the table is not empty.

*/
-- ClearTable
DELETE FROM "Command";

-- AlterTable
ALTER TABLE "Command" DROP COLUMN "response",
ADD COLUMN     "templateId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
