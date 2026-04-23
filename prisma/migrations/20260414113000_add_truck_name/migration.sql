-- AlterTable
ALTER TABLE "truck" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT 'Unnamed Truck';
