/*
  Warnings:

  - Added the required column `loading_in` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loading_out` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "loading_in" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "loading_out" TIMESTAMP(3) NOT NULL;
