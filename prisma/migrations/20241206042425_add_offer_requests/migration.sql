-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Aktif', 'Pasif');

-- CreateTable
CREATE TABLE "OfferRequests" (
    "id" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "creatorId" TEXT NOT NULL,
    "creatorInsId" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "OfferRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestSub" (
    "id" TEXT NOT NULL,
    "offerRequestId" TEXT NOT NULL,
    "servideId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "detail" TEXT,

    CONSTRAINT "RequestSub_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OfferRequests" ADD CONSTRAINT "OfferRequests_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferRequests" ADD CONSTRAINT "OfferRequests_creatorInsId_fkey" FOREIGN KEY ("creatorInsId") REFERENCES "Institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSub" ADD CONSTRAINT "RequestSub_offerRequestId_fkey" FOREIGN KEY ("offerRequestId") REFERENCES "OfferRequests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSub" ADD CONSTRAINT "RequestSub_servideId_fkey" FOREIGN KEY ("servideId") REFERENCES "Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
