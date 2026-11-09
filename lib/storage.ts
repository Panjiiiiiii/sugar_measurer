// lib/storage.ts
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

interface StoredFile {
    url: string;
    delete: () => Promise<void>;
}

export async function storeFile(
    buffer: Buffer,
    mimeType: string,
    relativeDir: string,
    fileName: string,
): Promise<StoredFile> {
    // Supabase Storage driver
    if (process.env.STORAGE_DRIVER === "supabase") {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "transfer-proofs";

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set when STORAGE_DRIVER=supabase");
        }

        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });

        const key = `${relativeDir}/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(key, buffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) {
            throw new Error(`Supabase Storage upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(key);

        const url = publicUrlData.publicUrl;

        return {
            url,
            delete: async () => {
                const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove([key]);
                if (deleteError) {
                    console.error(`Failed to delete ${key}:`, deleteError.message);
                }
            },
        };
    }

    // Vercel Blob driver
    if (process.env.STORAGE_DRIVER === "vercel-blob") {
        console.log("STORAGE_DRIVER =", process.env.STORAGE_DRIVER);
        const { put, del } = await import("@vercel/blob");
        const key = `${relativeDir}/${fileName}`;
        const blob = await put(key, buffer, { access: "public", contentType: mimeType });
        return { url: blob.url, delete: () => del(blob.url).then(() => undefined) };
    }

    // Default: local filesystem (Hostinger/VPS)
    const baseDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public");
    const absoluteDir = path.join(baseDir, relativeDir);
    const absoluteFilePath = path.join(absoluteDir, fileName);

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absoluteFilePath, buffer);

    const publicBaseUrl = process.env.UPLOAD_PUBLIC_BASE_URL ?? "";
    const url = `${publicBaseUrl}/${relativeDir.replace(/\\/g, "/")}/${fileName}`;

    return { url, delete: () => unlink(absoluteFilePath).catch(() => undefined) };
}
