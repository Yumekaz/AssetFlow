-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "approvedById" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Pending';
