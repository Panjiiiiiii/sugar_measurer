/*
  Warnings:

  - You are about to drop the column `account_number` on the `owner` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone_number]` on the table `owner` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone_number` to the `owner` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "owner_account_number_key";

-- AlterTable
ALTER TABLE "owner" DROP COLUMN "account_number",
ADD COLUMN     "phone_number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "owner_phone_number_key" ON "owner"("phone_number");
