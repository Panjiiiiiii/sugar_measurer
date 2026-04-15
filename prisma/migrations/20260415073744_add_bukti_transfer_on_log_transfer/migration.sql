/*
  Warnings:

  - You are about to drop the column `total_transactions` on the `logTransfer` table. All the data in the column will be lost.
  - Added the required column `bukti_transfer` to the `logTransfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "logTransfer" DROP COLUMN "total_transactions",
ADD COLUMN     "bukti_transfer" TEXT NOT NULL;
