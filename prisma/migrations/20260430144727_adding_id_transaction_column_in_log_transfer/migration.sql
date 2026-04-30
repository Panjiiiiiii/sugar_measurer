/*
  Warnings:

  - The values [branch] on the enum `role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bukti_transfer` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `truck` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `logTransfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cash', 'transfer', 'private');

-- CreateEnum
CREATE TYPE "transfer_status" AS ENUM ('in', 'out');

-- AlterEnum
ALTER TYPE "ownership_type" ADD VALUE 'special';

-- AlterEnum
BEGIN;
CREATE TYPE "role_new" AS ENUM ('operator', 'master', 'finance');
ALTER TABLE "user" ALTER COLUMN "role" TYPE "role_new" USING ("role"::text::"role_new");
ALTER TYPE "role" RENAME TO "role_old";
ALTER TYPE "role_new" RENAME TO "role";
DROP TYPE "public"."role_old";
COMMIT;

-- AlterEnum
ALTER TYPE "status_paid" ADD VALUE 'queue';

-- DropForeignKey
ALTER TABLE "logTransfer" DROP CONSTRAINT "logTransfer_location_id_fkey";

-- DropForeignKey
ALTER TABLE "truck" DROP CONSTRAINT "truck_owner_id_fkey";

-- AlterTable
ALTER TABLE "location" ALTER COLUMN "account_balance" DROP NOT NULL,
ALTER COLUMN "account_number" DROP NOT NULL,
ALTER COLUMN "account_number" DROP DEFAULT;

-- AlterTable
ALTER TABLE "logTransfer" ADD COLUMN     "transaction_id" TEXT,
ADD COLUMN     "transfer_status" "transfer_status" NOT NULL DEFAULT 'in',
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "location_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "owner" ADD COLUMN     "special_price" INTEGER;

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "bukti_transfer",
ADD COLUMN     "current_price" INTEGER,
ADD COLUMN     "driver_name" TEXT,
ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "payment_method" "payment_method" NOT NULL;

-- AlterTable
ALTER TABLE "truck" DROP COLUMN "owner_id";

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logTransfer" ADD CONSTRAINT "logTransfer_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logTransfer" ADD CONSTRAINT "logTransfer_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logTransfer" ADD CONSTRAINT "logTransfer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
