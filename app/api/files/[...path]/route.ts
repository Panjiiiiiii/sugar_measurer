import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path: filePath } = await params;
    const baseDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public");
    const absolutePath = path.join(baseDir, ...filePath);

    if (!absolutePath.startsWith(path.normalize(baseDir))) {
        return new Response("Forbidden", { status: 403 });
    }

    try {
        const file = await readFile(absolutePath);
        const ext = path.extname(absolutePath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".pdf": "application/pdf",
        };
        const contentType = contentTypeMap[ext] ?? "application/octet-stream";

        return new Response(file, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch {
        return new Response("Not found", { status: 404 });
    }
}