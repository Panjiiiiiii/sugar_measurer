/*
  Warnings:

  - Added the required column `bukti_transfer` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "bukti_transfer" TEXT NOT NULL;
