import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function backupAllData() {
  console.log("🔄 Starting MySQL data backup...\n");

  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `mysql-backup-${timestamp}.json`);

  try {
    // Export in foreign key order
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        source: "MySQL (Laragon)",
        databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"), // hide password
      },
      locations: await prisma.location.findMany(),
      users: await prisma.user.findMany(),
      owners: await prisma.owner.findMany(),
      trucks: await prisma.truck.findMany(),
      transactions: await prisma.transaction.findMany(),
      logTransfers: await prisma.logTransfer.findMany(),
      notifications: await prisma.notification.findMany(),
      pushSubscriptions: await prisma.push_subscription.findMany(),
    };

    // Write to file
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

    console.log("✅ Backup completed successfully!");
    console.log(`📁 Backup saved to: ${backupFile}\n`);
    console.log("Row counts:");
    console.log(`  - locations:        ${data.locations.length}`);
    console.log(`  - users:            ${data.users.length}`);
    console.log(`  - owners:           ${data.owners.length}`);
    console.log(`  - trucks:           ${data.trucks.length}`);
    console.log(`  - transactions:     ${data.transactions.length}`);
    console.log(`  - logTransfers:     ${data.logTransfers.length}`);
    console.log(`  - notifications:    ${data.notifications.length}`);
    console.log(`  - pushSubscriptions: ${data.pushSubscriptions.length}`);

    // Check for large integer values that might overflow Int32
    const INT32_MAX = 2147483647;
    let intOverflowWarnings: string[] = [];

    data.transactions.forEach((t) => {
      if (t.bruto_weight > INT32_MAX || t.tarra_weight > INT32_MAX || (t.netto_weight && t.netto_weight > INT32_MAX)) {
        intOverflowWarnings.push(`Transaction ${t.id}: weight exceeds Int32`);
      }
      if (t.current_price > INT32_MAX || (t.total_price && t.total_price > INT32_MAX)) {
        intOverflowWarnings.push(`Transaction ${t.id}: price exceeds Int32`);
      }
    });

    data.locations.forEach((l) => {
      if (l.sugar_price > INT32_MAX || (l.account_balance && l.account_balance > INT32_MAX)) {
        intOverflowWarnings.push(`Location ${l.id}: price/balance exceeds Int32`);
      }
    });

    data.logTransfers.forEach((lt) => {
      if (lt.transfer_amount > INT32_MAX) {
        intOverflowWarnings.push(`LogTransfer ${lt.id}: amount exceeds Int32`);
      }
    });

    if (intOverflowWarnings.length > 0) {
      console.log("\n⚠️  INTEGER OVERFLOW WARNINGS:");
      intOverflowWarnings.forEach((w) => console.log(`  - ${w}`));
      console.log("\n   Consider changing Int to BigInt in schema for money/weight fields.");
    } else {
      console.log("\n✅ All integer values are within Int32 range (safe for current schema).");
    }

  } catch (error) {
    console.error("❌ Backup failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupAllData();
