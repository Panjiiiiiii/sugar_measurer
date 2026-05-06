/*
  Warnings:

  - Added the required column `user_id` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `current_price` on table `transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "current_price" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
