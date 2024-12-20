-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_deviceTypeId_fkey";

-- AlterTable
ALTER TABLE "Notifications" ALTER COLUMN "deviceId" DROP NOT NULL,
ALTER COLUMN "deviceTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_deviceTypeId_fkey" FOREIGN KEY ("deviceTypeId") REFERENCES "DeviceTypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
