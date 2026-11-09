import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function createStorageBucket() {
  console.log("🪣 Creating Supabase Storage bucket...\n");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "transfer-proofs";

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  try {
    // Check if bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = existingBuckets?.some((b) => b.name === bucketName);

    if (bucketExists) {
      console.log(`✅ Bucket "${bucketName}" already exists`);
      
      // Update bucket settings
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5 MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "application/pdf",
        ],
      });

      if (updateError) {
        console.warn(`⚠️  Failed to update bucket settings: ${updateError.message}`);
      } else {
        console.log("✅ Bucket settings updated");
      }
    } else {
      // Create new bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5 MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "application/pdf",
        ],
      });

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }

      console.log(`✅ Bucket "${bucketName}" created successfully`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("Bucket Configuration:");
    console.log("=".repeat(80));
    console.log(`  Name:              ${bucketName}`);
    console.log(`  Public:            Yes (files accessible via public URL)`);
    console.log(`  Max file size:     5 MB`);
    console.log(`  Allowed types:     image/jpeg, image/png, image/webp, application/pdf`);
    console.log(`  Base URL:          ${supabaseUrl}/storage/v1/object/public/${bucketName}/`);
    console.log("=".repeat(80));

    console.log("\n📌 SECURITY TRADE-OFF:");
    console.log("=".repeat(80));
    console.log("✅ PRO: Public bucket - existing <img src> usage keeps working");
    console.log("   - No need to generate signed URLs for each image view");
    console.log("   - Simple integration with Next.js <Image> component");
    console.log("   - URLs are permanent and cacheable");
    console.log("\n⚠️  CON: Anyone with the URL can access the file");
    console.log("   - Files are accessible without authentication");
    console.log("   - URLs can be shared and will remain accessible");
    console.log("   - Consider using private bucket + signed URLs for sensitive documents");
    console.log("\n💡 ALTERNATIVE (not implemented now):");
    console.log("   - Set public: false");
    console.log("   - Generate signed URLs with expiration (e.g. 1 hour)");
    console.log("   - Serve through API route that checks authentication");
    console.log("   - More secure but requires URL regeneration");
    console.log("=".repeat(80));

    console.log("\n✅ Bucket setup complete!");

  } catch (error) {
    console.error("❌ Bucket creation failed:", error);
    process.exit(1);
  }
}

createStorageBucket();
