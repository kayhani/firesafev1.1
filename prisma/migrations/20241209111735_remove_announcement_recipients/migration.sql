/*
  Warnings:

  - You are about to drop the column `recipientId` on the `Announcements` table. All the data in the column will be lost.
  - You are about to drop the column `recipientInsId` on the `Announcements` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Announcements" DROP CONSTRAINT "Announcements_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "Announcements" DROP CONSTRAINT "Announcements_recipientInsId_fkey";

-- AlterTable
ALTER TABLE "Announcements" DROP COLUMN "recipientId",
DROP COLUMN "recipientInsId";
