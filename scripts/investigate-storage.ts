import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function investigateStorage() {
  console.log("🔍 Investigating storage setup and file locations...\n");

  try {
    // Get all distinct bukti_transfer values
    const transfers = await prisma.logTransfer.findMany({
      select: {
        id: true,
        bukti_transfer: true,
        created_at: true,
        transfer_status: true,
      },
      orderBy: { created_at: "desc" },
    });

    console.log("📊 Total logTransfer records:", transfers.length);
    console.log("\n" + "=".repeat(80));
    console.log("Sample bukti_transfer values:");
    console.log("=".repeat(80));

    // Group by pattern
    const patterns: Record<string, number> = {};
    const samples: Record<string, string[]> = {};

    for (const t of transfers) {
      let pattern = "unknown";
      
      if (t.bukti_transfer === "cash" || t.bukti_transfer === "") {
        pattern = "cash/empty";
      } else if (t.bukti_transfer.startsWith("http://") || t.bukti_transfer.startsWith("https://")) {
        if (t.bukti_transfer.includes("blob.vercel-storage.com")) {
          pattern = "vercel-blob";
        } else if (t.bukti_transfer.includes("supabase")) {
          pattern = "supabase";
        } else if (t.bukti_transfer.includes("railway")) {
          pattern = "railway";
        } else {
          pattern = "other-url";
        }
      } else if (t.bukti_transfer.startsWith("/")) {
        pattern = "relative-path";
      } else {
        pattern = "unknown";
      }

      patterns[pattern] = (patterns[pattern] || 0) + 1;
      if (!samples[pattern]) samples[pattern] = [];
      if (samples[pattern].length < 3) {
        samples[pattern].push(t.bukti_transfer);
      }
    }

    console.log("\nPattern Distribution:");
    console.log("-".repeat(80));
    for (const [pattern, count] of Object.entries(patterns)) {
      console.log(`  ${pattern.padEnd(20)} : ${count} files`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("Sample Values by Pattern:");
    console.log("=".repeat(80));

    for (const [pattern, sampleList] of Object.entries(samples)) {
      console.log(`\n${pattern.toUpperCase()}:`);
      sampleList.forEach((sample, idx) => {
        const display = sample.length > 100 ? sample.substring(0, 100) + "..." : sample;
        console.log(`  ${idx + 1}. ${display}`);
      });
    }

    // Check environment variables
    console.log("\n" + "=".repeat(80));
    console.log("Environment Configuration:");
    console.log("=".repeat(80));
    console.log("STORAGE_DRIVER:", process.env.STORAGE_DRIVER || "(not set, defaults to local)");
    console.log("UPLOAD_DIR:", process.env.UPLOAD_DIR || "(not set, defaults to ./public)");
    console.log("UPLOAD_PUBLIC_BASE_URL:", process.env.UPLOAD_PUBLIC_BASE_URL || "(not set)");

    // Check if files exist locally
    console.log("\n" + "=".repeat(80));
    console.log("Checking local file system:");
    console.log("=".repeat(80));

    const { existsSync } = await import("fs");
    const path = await import("path");
    
    const publicDir = path.join(process.cwd(), "public", "finance", "transfer");
    const uploadDir = process.env.UPLOAD_DIR 
      ? path.join(process.env.UPLOAD_DIR, "finance", "transfer")
      : null;

    console.log("Checking:", publicDir);
    console.log("Exists:", existsSync(publicDir));

    if (uploadDir) {
      console.log("Checking:", uploadDir);
      console.log("Exists:", existsSync(uploadDir));
    }

    if (existsSync(publicDir)) {
      const { readdirSync } = await import("fs");
      const files = readdirSync(publicDir);
      console.log(`Found ${files.length} files in public/finance/transfer/`);
      if (files.length > 0) {
        console.log("Sample files:", files.slice(0, 5));
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("🔍 Investigation complete!");
    console.log("=".repeat(80));

  } catch (error) {
    console.error("❌ Investigation failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

investigateStorage();
