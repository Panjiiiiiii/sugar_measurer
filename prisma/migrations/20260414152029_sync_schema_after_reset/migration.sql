-- AlterTable
ALTER TABLE "location" ADD COLUMN     "account_balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "account_number" TEXT NOT NULL DEFAULT '0000000000';

-- CreateTable
CREATE TABLE "logTransfer" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "total_transactions" INTEGER NOT NULL,
    "transfer_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logTransfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "logTransfer" ADD CONSTRAINT "logTransfer_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logTransfer" ADD CONSTRAINT "logTransfer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
