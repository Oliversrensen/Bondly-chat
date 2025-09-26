/*
  Warnings:

  - You are about to drop the column `matchId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_matchId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "matchId",
ADD COLUMN     "roomId" TEXT NOT NULL;
