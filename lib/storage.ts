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
    if (process.env.STORAGE_DRIVER === "vercel-blob") {
        const { put, del } = await import("@vercel/blob");
        const key = `${relativeDir}/${fileName}`;
        const blob = await put(key, buffer, { access: "public", contentType: mimeType });
        return { url: blob.url, delete: () => del(blob.url).then(() => undefined) };
    }

    // default: local filesystem (Hostinger/VPS)
    const baseDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public");
    const absoluteDir = path.join(baseDir, relativeDir);
    const absoluteFilePath = path.join(absoluteDir, fileName);

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absoluteFilePath, buffer);

    const publicBaseUrl = process.env.UPLOAD_PUBLIC_BASE_URL ?? "";
    const url = `${publicBaseUrl}/${relativeDir.replace(/\\/g, "/")}/${fileName}`;

    return { url, delete: () => unlink(absoluteFilePath).catch(() => undefined) };
}