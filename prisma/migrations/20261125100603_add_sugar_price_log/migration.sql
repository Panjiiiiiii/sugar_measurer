-- CreateTable
CREATE TABLE "sugar_price_log" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "old_price" INTEGER,
    "new_price" INTEGER NOT NULL,
    "changed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sugar_price_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sugar_price_log_location_id_created_at_idx" ON "sugar_price_log"("location_id", "created_at");

-- AddForeignKey
ALTER TABLE "sugar_price_log" ADD CONSTRAINT "sugar_price_log_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sugar_price_log" ADD CONSTRAINT "sugar_price_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Enable RLS (no policies), consistent with the other tables
ALTER TABLE "sugar_price_log" ENABLE ROW LEVEL SECURITY;
