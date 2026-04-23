-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_truck_id_fkey";

-- DropForeignKey
ALTER TABLE "truck" DROP CONSTRAINT "truck_owner_id_fkey";

-- AddForeignKey
ALTER TABLE "truck" ADD CONSTRAINT "truck_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "truck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
