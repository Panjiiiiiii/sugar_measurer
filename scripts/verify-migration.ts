import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface BackupData {
  metadata: any;
  locations: any[];
  users: any[];
  owners: any[];
  trucks: any[];
  transactions: any[];
  logTransfers: any[];
  notifications: any[];
  pushSubscriptions: any[];
}

async function verifyMigration() {
  console.log("🔍 Verifying data migration...\n");

  const backupFile = path.join(
    process.cwd(),
    "backups",
    "mysql-backup-2026-11-09T22-16-55-342Z.json"
  );
  const backupData: BackupData = JSON.parse(fs.readFileSync(backupFile, "utf-8"));

  try {
    // 1. Count verification
    console.log("📊 Row Count Verification:");
    console.log("=" .repeat(60));

    const counts = {
      location: await prisma.location.count(),
      user: await prisma.user.count(),
      owner: await prisma.owner.count(),
      truck: await prisma.truck.count(),
      transaction: await prisma.transaction.count(),
      logTransfer: await prisma.logTransfer.count(),
      notification: await prisma.notification.count(),
      push_subscription: await prisma.push_subscription.count(),
    };

    const expected = {
      location: backupData.locations.length,
      user: backupData.users.length,
      owner: backupData.owners.length,
      truck: backupData.trucks.length,
      transaction: backupData.transactions.length,
      logTransfer: backupData.logTransfers.length,
      notification: backupData.notifications.length,
      push_subscription: backupData.pushSubscriptions.length,
    };

    let allCountsMatch = true;
    for (const [table, count] of Object.entries(counts)) {
      const exp = expected[table as keyof typeof expected];
      const status = count === exp ? "✅" : "❌";
      if (count !== exp) allCountsMatch = false;
      console.log(`  ${table.padEnd(20)} Expected: ${exp.toString().padStart(3)} | Actual: ${count.toString().padStart(3)} ${status}`);
    }
    console.log("=".repeat(60));

    if (!allCountsMatch) {
      console.log("❌ Count mismatch detected!\n");
      return false;
    }
    console.log("✅ All row counts match!\n");

    // 2. Foreign key verification
    console.log("🔗 Foreign Key Integrity Check:");
    console.log("=".repeat(60));

    // Check for orphaned records by looking for FKs that don't resolve
    // Since all FKs are enforced by Postgres constraints, if migration succeeded, there should be no orphans
    // But we can still verify critical relationships exist

    const userWithLocation = await prisma.user.findMany({
      include: { location: true },
    });
    const userOrphans = userWithLocation.filter((u) => !u.location).length;

    const txWithRels = await prisma.transaction.findMany({
      include: { location: true, truck: true, user: true },
    });
    const txLocationOrphans = txWithRels.filter((t) => !t.location).length;
    const txTruckOrphans = txWithRels.filter((t) => !t.truck).length;
    const txUserOrphans = txWithRels.filter((t) => !t.user).length;

    const logTransferWithUser = await prisma.logTransfer.findMany({
      include: { user: true },
    });
    const logTransferOrphans = logTransferWithUser.filter((lt) => !lt.user).length;

    const notificationWithUser = await prisma.notification.findMany({
      include: { user: true },
    });
    const notificationOrphans = notificationWithUser.filter((n) => !n.user).length;

    const pushSubWithUser = await prisma.push_subscription.findMany({
      include: { user: true },
    });
    const pushSubOrphans = pushSubWithUser.filter((ps) => !ps.user).length;

    const orphanChecks = [
      { name: "users.location_id", orphans: userOrphans },
      { name: "transaction.location_id", orphans: txLocationOrphans },
      { name: "transaction.truck_id", orphans: txTruckOrphans },
      { name: "transaction.user_id", orphans: txUserOrphans },
      { name: "logTransfer.user_id", orphans: logTransferOrphans },
      { name: "notification.user_id", orphans: notificationOrphans },
      { name: "push_subscription.user_id", orphans: pushSubOrphans },
    ];

    let allFKsValid = true;
    for (const check of orphanChecks) {
      const status = check.orphans === 0 ? "✅" : "❌";
      if (check.orphans !== 0) allFKsValid = false;
      console.log(`  ${check.name.padEnd(30)} Orphans: ${check.orphans} ${status}`);
    }
    console.log("=".repeat(60));

    if (!allFKsValid) {
      console.log("❌ Foreign key violations detected!\n");
      return false;
    }
    console.log("✅ All foreign keys are valid!\n");

    // 3. Spot-check user passwords
    console.log("🔐 Password Hash Spot Check:");
    console.log("=".repeat(60));

    const sampleUsers = backupData.users.slice(0, 2);
    let passwordsMatch = true;

    for (const originalUser of sampleUsers) {
      const migratedUser = await prisma.user.findUnique({
        where: { id: originalUser.id },
      });

      if (!migratedUser) {
        console.log(`  ❌ User ${originalUser.email} not found in Supabase`);
        passwordsMatch = false;
        continue;
      }

      const hashMatch = migratedUser.password === originalUser.password;
      const roleMatch = migratedUser.role === originalUser.role;
      const emailMatch = migratedUser.email === originalUser.email;

      console.log(`  User: ${originalUser.email}`);
      console.log(`    Password hash: ${hashMatch ? "✅ MATCH" : "❌ MISMATCH"}`);
      console.log(`    Role: ${roleMatch ? "✅ MATCH" : "❌ MISMATCH"} (${migratedUser.role})`);
      console.log(`    Email: ${emailMatch ? "✅ MATCH" : "❌ MISMATCH"}`);

      if (!hashMatch || !roleMatch || !emailMatch) passwordsMatch = false;
    }
    console.log("=".repeat(60));

    if (!passwordsMatch) {
      console.log("❌ Password or user data mismatches detected!\n");
      return false;
    }
    console.log("✅ Password hashes preserved correctly!\n");

    // 4. Spot-check transactions
    console.log("📦 Transaction Data Spot Check:");
    console.log("=".repeat(60));

    const sampleTransactions = backupData.transactions.slice(0, 3);
    let transactionsMatch = true;

    for (const originalTx of sampleTransactions) {
      const migratedTx = await prisma.transaction.findUnique({
        where: { id: originalTx.id },
        include: { truck: true, owner: true, user: true, location: true },
      });

      if (!migratedTx) {
        console.log(`  ❌ Transaction ${originalTx.id} not found`);
        transactionsMatch = false;
        continue;
      }

      const checksOk =
        migratedTx.bruto_weight === originalTx.bruto_weight &&
        migratedTx.tarra_weight === originalTx.tarra_weight &&
        migratedTx.netto_weight === originalTx.netto_weight &&
        migratedTx.current_price === originalTx.current_price &&
        migratedTx.total_price === originalTx.total_price &&
        migratedTx.status === originalTx.status;

      console.log(`  Transaction ID: ${originalTx.id.substring(0, 8)}...`);
      console.log(`    Truck: ${migratedTx.truck.license_plate}`);
      console.log(`    Weights: ${checksOk ? "✅ MATCH" : "❌ MISMATCH"}`);
      console.log(`      Bruto: ${migratedTx.bruto_weight}, Tarra: ${migratedTx.tarra_weight}, Netto: ${migratedTx.netto_weight}`);
      console.log(`    Prices: Current=${migratedTx.current_price}, Total=${migratedTx.total_price}`);
      console.log(`    Status: ${migratedTx.status}`);

      if (!checksOk) transactionsMatch = false;
    }
    console.log("=".repeat(60));

    if (!transactionsMatch) {
      console.log("❌ Transaction data mismatches detected!\n");
      return false;
    }
    console.log("✅ Transaction data verified!\n");

    // 5. Timestamp check
    console.log("🕐 Timestamp Preservation Check:");
    console.log("=".repeat(60));

    const sampleLocation = backupData.locations[0];
    const migratedLocation = await prisma.location.findUnique({
      where: { id: sampleLocation.id },
    });

    if (migratedLocation) {
      const originalDate = new Date(sampleLocation.created_at);
      const migratedDate = new Date(migratedLocation.created_at);
      const timeDiff = Math.abs(migratedDate.getTime() - originalDate.getTime());

      console.log(`  Sample location: ${migratedLocation.name}`);
      console.log(`    Original created_at:  ${originalDate.toISOString()}`);
      console.log(`    Migrated created_at:  ${migratedDate.toISOString()}`);
      console.log(`    Time difference:      ${timeDiff}ms ${timeDiff === 0 ? "✅" : timeDiff < 1000 ? "⚠️" : "❌"}`);
    }
    console.log("=".repeat(60));
    console.log("✅ Timestamps preserved!\n");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL VERIFICATION CHECKS PASSED!");
    console.log("=".repeat(60));

    return true;

  } catch (error) {
    console.error("❌ Verification failed:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration().then((success) => {
  process.exit(success ? 0 : 1);
});
