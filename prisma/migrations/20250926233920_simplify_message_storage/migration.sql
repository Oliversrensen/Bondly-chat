/*
  Warnings:

  - You are about to drop the column `matchId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_matchId_fkey";

-- Add roomId column with default value first
ALTER TABLE "Message" ADD COLUMN "roomId" TEXT DEFAULT 'legacy';

-- Update existing messages to have a roomId (use a default value)
UPDATE "Message" SET "roomId" = 'legacy-' || "id" WHERE "roomId" = 'legacy';

-- Now make roomId NOT NULL
ALTER TABLE "Message" ALTER COLUMN "roomId" SET NOT NULL;

-- Drop the matchId column
ALTER TABLE "Message" DROP COLUMN "matchId";
