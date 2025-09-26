/*
  Warnings:

  - You are about to drop the column `anonHandle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordSetAt` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_anonHandle_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "anonHandle",
DROP COLUMN "emailVerified",
DROP COLUMN "passwordHash",
DROP COLUMN "passwordSetAt",
ADD COLUMN     "isPro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sillyName" TEXT;
