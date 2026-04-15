/*
  Warnings:

  - You are about to drop the column `user_id` on the `logTransfer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "logTransfer" DROP CONSTRAINT "logTransfer_user_id_fkey";

-- AlterTable
ALTER TABLE "logTransfer" DROP COLUMN "user_id";
