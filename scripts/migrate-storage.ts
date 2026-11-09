import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

interface MigrationResult {
  id: string;
  oldValue: string;
  newUrl: string | null;
  status: "migrated" | "skipped" | "failed";
  reason?: string;
}

async function migrateStorage(dryRun: boolean = false) {
  console.log(`🔄 ${dryRun ? "DRY RUN:" : ""} Migrating storage from local to Supabase...\n`);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "transfer-proofs";

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    process.exit(1);
  }

  if (supabaseUrl.includes("[YOUR-PROJECT-ID]") || supabaseKey.includes("[YOUR-SERVICE-ROLE-KEY]")) {
    console.error("❌ Please fill in the Supabase credentials in .env file:");
    console.error("   - SUPABASE_URL: Replace [YOUR-PROJECT-ID] with your actual project ID");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY: Replace [YOUR-SERVICE-ROLE-KEY] with your actual service role key");
    console.error("\n   You can find these in: Supabase Dashboard → Project Settings → API");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const results: MigrationResult[] = [];
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    // Get all logTransfer rows that need migration
    const transfers = await prisma.logTransfer.findMany({
      where: {
        bukti_transfer: {
          not: "",
        },
      },
      orderBy: { created_at: "asc" },
    });

    console.log(`📊 Found ${transfers.length} logTransfer records\n`);
    console.log("=".repeat(100));

    for (const transfer of transfers) {
      const oldValue = transfer.bukti_transfer;

      // Skip if it's cash
      if (oldValue === "cash" || oldValue === "") {
        results.push({
          id: transfer.id,
          oldValue,
          newUrl: null,
          status: "skipped",
          reason: "Cash payment (no file)",
        });
        skipped++;
        console.log(`⏭️  SKIP: ${transfer.id.substring(0, 8)}... - Cash payment`);
        continue;
      }

      // Skip if already a Supabase URL
      if (oldValue.includes("supabase.co")) {
        results.push({
          id: transfer.id,
          oldValue,
          newUrl: oldValue,
          status: "skipped",
          reason: "Already migrated to Supabase",
        });
        skipped++;
        console.log(`⏭️  SKIP: ${transfer.id.substring(0, 8)}... - Already on Supabase`);
        continue;
      }

      // Extract filename from relative path
      const fileName = oldValue.split("/").pop()?.trim();
      if (!fileName) {
        results.push({
          id: transfer.id,
          oldValue,
          newUrl: null,
          status: "failed",
          reason: "Could not extract filename",
        });
        failed++;
        console.log(`❌ FAIL: ${transfer.id.substring(0, 8)}... - Invalid path: ${oldValue}`);
        continue;
      }

      // Check if file exists locally
      const localPath = path.join(process.cwd(), "public", "finance", "transfer", fileName);
      let fileBuffer: Buffer;

      try {
        fileBuffer = await readFile(localPath);
      } catch (error) {
        results.push({
          id: transfer.id,
          oldValue,
          newUrl: null,
          status: "failed",
          reason: `File not found on disk: ${localPath}`,
        });
        failed++;
        console.log(`❌ FAIL: ${transfer.id.substring(0, 8)}... - File missing: ${fileName}`);
        continue;
      }

      if (dryRun) {
        console.log(`📋 WOULD MIGRATE: ${transfer.id.substring(0, 8)}...`);
        console.log(`   Old: ${oldValue}`);
        console.log(`   New: ${supabaseUrl}/storage/v1/object/public/${bucketName}/finance/transfer/${fileName}`);
        console.log(`   File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
        migrated++;
        continue;
      }

      // Upload to Supabase
      const storagePath = `finance/transfer/${fileName}`;
      const mimeType = getMimeType(fileName);

      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: true, // Allow overwrite if re-running
          });

        if (error) {
          throw new Error(error.message);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath);

        const newUrl = publicUrlData.publicUrl;

        // Update database
        await prisma.logTransfer.update({
          where: { id: transfer.id },
          data: { bukti_transfer: newUrl },
        });

        results.push({
          id: transfer.id,
          oldValue,
          newUrl,
          status: "migrated",
        });

        migrated++;
        console.log(`✅ MIGRATED: ${transfer.id.substring(0, 8)}...`);
        console.log(`   Old: ${oldValue}`);
        console.log(`   New: ${newUrl}`);
        console.log(`   Size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);

      } catch (error) {
        results.push({
          id: transfer.id,
          oldValue,
          newUrl: null,
          status: "failed",
          reason: error instanceof Error ? error.message : String(error),
        });
        failed++;
        console.log(`❌ FAIL: ${transfer.id.substring(0, 8)}... - Upload error: ${error instanceof Error ? error.message : error}`);
      }
    }

    console.log("\n" + "=".repeat(100));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(100));
    console.log(`Total records:       ${transfers.length}`);
    console.log(`${dryRun ? "Would migrate" : "Migrated"}:       ${migrated}`);
    console.log(`Skipped:             ${skipped}`);
    console.log(`Failed:              ${failed}`);
    console.log("=".repeat(100));

    if (failed > 0) {
      console.log("\n⚠️  FAILED RECORDS:");
      results
        .filter((r) => r.status === "failed")
        .forEach((r) => {
          console.log(`  - ${r.id.substring(0, 8)}... : ${r.reason}`);
        });
    }

    if (dryRun) {
      console.log("\n📌 This was a DRY RUN. No changes were made.");
      console.log("   Run without --dry-run to perform the actual migration.");
    } else {
      console.log("\n✅ Migration complete!");
      console.log("   Original files in public/finance/transfer/ were NOT deleted (read-only).");
    }

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  return { migrated, skipped, failed, results };
}

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };
  return mimeMap[ext] || "application/octet-stream";
}

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

migrateStorage(dryRun).then(({ migrated, skipped, failed }) => {
  process.exit(failed > 0 ? 1 : 0);
});
