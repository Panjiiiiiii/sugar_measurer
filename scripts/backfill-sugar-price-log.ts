/**
 * Backfill sugar_price_log with one initial row per existing location
 * (old_price null, new_price = current sugar_price, changed_by null, created_at = now).
 *
 * Idempotent: locations that already have any log row are skipped.
 *
 * Run: npx tsx scripts/backfill-sugar-price-log.ts
 */
import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany({
    where: { sugarPriceLogs: { none: {} } },
    select: { id: true, name: true, sugar_price: true },
  });
  const total = await prisma.location.count();

  console.log(`Locations: ${total} total, ${locations.length} without a price log.`);

  if (locations.length === 0) {
    console.log("Nothing to backfill.");
    return;
  }

  const now = new Date();
  const result = await prisma.sugar_price_log.createMany({
    data: locations.map((l) => ({
      location_id: l.id,
      old_price: null,
      new_price: l.sugar_price,
      changed_by: null,
      created_at: now,
    })),
  });

  for (const l of locations) console.log(`  + ${l.name}: ${l.sugar_price}`);
  console.log(`Inserted ${result.count} row(s); skipped ${total - locations.length}.`);
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e instanceof Error ? e.message.split("\n").pop() : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
