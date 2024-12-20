/*
  Warnings:

  - You are about to drop the column `servideId` on the `RequestSub` table. All the data in the column will be lost.
  - Added the required column `requiredDate` to the `RequestSub` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `RequestSub` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'Beklemede';
ALTER TYPE "RequestStatus" ADD VALUE 'Iptal';
ALTER TYPE "RequestStatus" ADD VALUE 'TeklifAlindi';
ALTER TYPE "RequestStatus" ADD VALUE 'Tamamlandi';

-- DropForeignKey
ALTER TABLE "RequestSub" DROP CONSTRAINT "RequestSub_servideId_fkey";

-- AlterTable
ALTER TABLE "RequestSub" DROP COLUMN "servideId",
ADD COLUMN     "requiredDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RequestSub" ADD CONSTRAINT "RequestSub_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
