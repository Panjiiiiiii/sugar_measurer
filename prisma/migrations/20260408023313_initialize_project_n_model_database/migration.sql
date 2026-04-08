-- CreateEnum
CREATE TYPE "role" AS ENUM ('branch', 'master', 'finance');

-- CreateEnum
CREATE TYPE "ownership_type" AS ENUM ('farmer', 'private');

-- CreateEnum
CREATE TYPE "status_paid" AS ENUM ('paid', 'unpaid');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "role" NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "ownership_type" "ownership_type" NOT NULL,

    CONSTRAINT "owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sugar_price" INTEGER NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truck" (
    "id" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "truck_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "bruto_weight" INTEGER NOT NULL,
    "tarra_weight" INTEGER NOT NULL,
    "netto_weight" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "status" "status_paid" NOT NULL DEFAULT 'unpaid',

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "owner_account_number_key" ON "owner"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "truck_license_plate_key" ON "truck"("license_plate");

-- AddForeignKey
ALTER TABLE "truck" ADD CONSTRAINT "truck_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
