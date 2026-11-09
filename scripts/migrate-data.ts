import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import * as fs from "fs";
import * as path from "path";

// Debug: verify DATABASE_URL is loaded
console.log("DATABASE_URL protocol check:", process.env.DATABASE_URL?.substring(0, 15) || "UNDEFINED");
if (!process.env.DATABASE_URL?.startsWith("postgres")) {
  console.error("❌ DATABASE_URL does not start with 'postgres://' or 'postgresql://'");
  console.error("   Current value starts with:", process.env.DATABASE_URL?.substring(0, 30));
  process.exit(1);
}

const prisma = new PrismaClient();

interface BackupData {
  metadata: {
    exportDate: string;
    source: string;
    databaseUrl?: string;
  };
  locations: any[];
  users: any[];
  owners: any[];
  trucks: any[];
  transactions: any[];
  logTransfers: any[];
  notifications: any[];
  pushSubscriptions: any[];
}

// Convert date strings to Date objects, preserve nulls
function parseDate(value: any): Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

// Prepare data for insertion (convert dates, keep nulls)
function prepareData<T extends Record<string, any>>(items: T[]): T[] {
  return items.map((item) => {
    const prepared: any = {};
    for (const [key, value] of Object.entries(item)) {
      // Date fields
      if (
        key === "created_at" ||
        key === "updated_at" ||
        key === "transaction_date" ||
        key === "loading_in" ||
        key === "loading_out"
      ) {
        prepared[key] = parseDate(value);
      } else {
        prepared[key] = value;
      }
    }
    return prepared as T;
  });
}

async function insertInBatches<T extends Record<string, any>>(
  modelName: string,
  data: T[],
  batchSize: number = 500
): Promise<number> {
  let totalInserted = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const model = (prisma as any)[modelName];

    if (!model) {
      throw new Error(`Model ${modelName} not found on Prisma client`);
    }

    const result = await model.createMany({
      data: batch,
      skipDuplicates: true,
    });

    totalInserted += result.count;
  }

  return totalInserted;
}

async function migrateData() {
  console.log("🔄 Starting data migration from MySQL backup to Supabase...\n");

  const backupFile = path.join(
    process.cwd(),
    "backups",
    "mysql-backup-2026-11-09T22-16-55-342Z.json"
  );

  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file not found: ${backupFile}`);
  }

  const backupData: BackupData = JSON.parse(fs.readFileSync(backupFile, "utf-8"));

  console.log("📊 Backup data loaded:");
  console.log(`  - locations:        ${backupData.locations.length}`);
  console.log(`  - users:            ${backupData.users.length}`);
  console.log(`  - owners:           ${backupData.owners.length}`);
  console.log(`  - trucks:           ${backupData.trucks.length}`);
  console.log(`  - transactions:     ${backupData.transactions.length}`);
  console.log(`  - logTransfers:     ${backupData.logTransfers.length}`);
  console.log(`  - notifications:    ${backupData.notifications.length}`);
  console.log(`  - pushSubscriptions: ${backupData.pushSubscriptions.length}\n`);

  const results: Record<string, { source: number; inserted: number }> = {};

  try {
    // Insert in foreign key dependency order

    // 1. Location (no dependencies)
    console.log("📍 Migrating locations...");
    const locations = prepareData(backupData.locations);
    const locationsInserted = await insertInBatches("location", locations);
    results.location = { source: locations.length, inserted: locationsInserted };
    console.log(`   ✅ Inserted ${locationsInserted}/${locations.length} locations\n`);

    // 2. User (depends on location)
    console.log("👤 Migrating users...");
    const users = prepareData(backupData.users);
    const usersInserted = await insertInBatches("user", users);
    results.user = { source: users.length, inserted: usersInserted };
    console.log(`   ✅ Inserted ${usersInserted}/${users.length} users\n`);

    // 3. Owner (no dependencies)
    console.log("🏢 Migrating owners...");
    const owners = prepareData(backupData.owners);
    const ownersInserted = await insertInBatches("owner", owners);
    results.owner = { source: owners.length, inserted: ownersInserted };
    console.log(`   ✅ Inserted ${ownersInserted}/${owners.length} owners\n`);

    // 4. Truck (no dependencies)
    console.log("🚛 Migrating trucks...");
    const trucks = prepareData(backupData.trucks);
    const trucksInserted = await insertInBatches("truck", trucks);
    results.truck = { source: trucks.length, inserted: trucksInserted };
    console.log(`   ✅ Inserted ${trucksInserted}/${trucks.length} trucks\n`);

    // 5. Transaction (depends on location, user, owner, truck)
    console.log("📦 Migrating transactions...");
    const transactions = prepareData(backupData.transactions);
    const transactionsInserted = await insertInBatches("transaction", transactions);
    results.transaction = { source: transactions.length, inserted: transactionsInserted };
    console.log(`   ✅ Inserted ${transactionsInserted}/${transactions.length} transactions\n`);

    // 6. LogTransfer (depends on user, location, transaction)
    console.log("💸 Migrating logTransfers...");
    const logTransfers = prepareData(backupData.logTransfers);
    const logTransfersInserted = await insertInBatches("logTransfer", logTransfers);
    results.logTransfer = { source: logTransfers.length, inserted: logTransfersInserted };
    console.log(`   ✅ Inserted ${logTransfersInserted}/${logTransfers.length} logTransfers\n`);

    // 7. Notification (depends on user)
    console.log("🔔 Migrating notifications...");
    const notifications = prepareData(backupData.notifications);
    const notificationsInserted = await insertInBatches("notification", notifications);
    results.notification = { source: notifications.length, inserted: notificationsInserted };
    console.log(`   ✅ Inserted ${notificationsInserted}/${notifications.length} notifications\n`);

    // 8. Push Subscription (depends on user)
    console.log("📱 Migrating push subscriptions...");
    const pushSubscriptions = prepareData(backupData.pushSubscriptions);
    const pushSubscriptionsInserted = await insertInBatches("push_subscription", pushSubscriptions);
    results.push_subscription = {
      source: pushSubscriptions.length,
      inserted: pushSubscriptionsInserted,
    };
    console.log(
      `   ✅ Inserted ${pushSubscriptionsInserted}/${pushSubscriptions.length} push subscriptions\n`
    );

    // Summary table
    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log("Table               | Source Rows | Inserted | Status");
    console.log("-".repeat(60));

    for (const [model, counts] of Object.entries(results)) {
      const status = counts.source === counts.inserted ? "✅ OK" : "⚠️  MISMATCH";
      const modelPadded = model.padEnd(18);
      const sourcePadded = counts.source.toString().padStart(11);
      const insertedPadded = counts.inserted.toString().padStart(8);
      console.log(`${modelPadded} | ${sourcePadded} | ${insertedPadded} | ${status}`);
    }
    console.log("=".repeat(60));

    // Check for mismatches
    const mismatches = Object.entries(results).filter(([_, counts]) => counts.source !== counts.inserted);
    if (mismatches.length > 0) {
      console.log("\n⚠️  WARNING: Some tables have mismatches!");
      console.log("   This may be due to skipDuplicates if data was already present.");
    } else {
      console.log("\n✅ All data migrated successfully!");
    }

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
