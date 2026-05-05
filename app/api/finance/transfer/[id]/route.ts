import { prisma } from "@/lib/prisma";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateCreateTransferInput } from "@/schema/transfer";
import { z } from "zod";

const BASE64_PATTERN = /^data:([\w/+.-]+);base64,([A-Za-z0-9+/=\s]+)$/;

function getExtensionFromMimeType(mimeType: string) {
    const mimeMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf",
    };

    return mimeMap[mimeType] ?? "bin";
}

function decodeBase64File(base64Input?: string) {
    if (!base64Input) return null;
    const trimmedInput = base64Input.trim();
    const matched = trimmedInput.match(BASE64_PATTERN);
    const mimeType = matched?.[1];
    const base64Data = matched?.[2] ?? trimmedInput;
    const finalMimeType = mimeType ?? "application/octet-stream";

    try {
        const normalizedBase64 = base64Data.replace(/\s/g, "");
        const buffer = Buffer.from(normalizedBase64, "base64");

        if (!buffer.byteLength) {
            return null;
        }

        return {
            mimeType: finalMimeType,
            buffer,
        };
    } catch {
        return null;
    }
}

function formatTransferTimestamp(date: Date) {
    return date.toISOString().replace(/[:.]/g, "-");
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: locationId } = await params;
        const rawPayload = await request.json();
        const payload = validateCreateTransferInput(rawPayload);
        const amount = payload.amount;

        const decodedFile = decodeBase64File(payload.bukti_transfer);

        if (!decodedFile) {
            return Response.json(
                {
                    message: "Invalid bukti transfer base64 format",
                },
                { status: 400 },
            );
        }

        const extension = getExtensionFromMimeType(decodedFile.mimeType);
        const relativeDirectory = path.join("finance", "transfer");
        const absoluteDirectory = path.join(process.cwd(), "public", relativeDirectory);
        const transferTimestamp = formatTransferTimestamp(new Date());
        const fileName = `${locationId}-${transferTimestamp}.${extension}`;
        const absoluteFilePath = path.join(absoluteDirectory, fileName);
        const publicFilePath = `/${relativeDirectory.replace(/\\/g, "/")}/${fileName}`;

        await mkdir(absoluteDirectory, { recursive: true });
        await writeFile(absoluteFilePath, decodedFile.buffer);

        let transactionResult: {
            updatedLocation: unknown;
            transferLog: unknown;
        } | null = null;

        try {
            transactionResult = await prisma.$transaction(async (tx) => {
                const existingLocation = await tx.location.findUnique({
                    where: { id: locationId },
                });

                if (!existingLocation) {
                    return null;
                }

                const updatedLocation = await tx.location.update({
                    where: { id: existingLocation.id },
                    data: {
                        account_balance: {
                            increment: amount,
                        },
                    },
                });

                const transferLog = await tx.logTransfer.create({
                    data: {
                        location_id: existingLocation.id,
                        user_id: payload.user_id,
                        bukti_transfer: publicFilePath ?? "cash",
                        transfer_status : "in",
                        transfer_amount: amount,
                    },
                });

                return {
                    updatedLocation,
                    transferLog,
                };
            });
        } catch (dbError) {
            await unlink(absoluteFilePath).catch(() => undefined);
            throw dbError;
        }

        if (!transactionResult) {
            return Response.json(
                {
                    message: "Location not found",
                    data: null,
                },
                { status: 404 },
            );
        }

        return Response.json(
            {
                statusCode: 201,
                message: "Transfer added successfully",
            },
            { status: 201 },
        );

    } catch (error) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            const firstErrorMessage = validationErrors[0]?.message ?? "Validation failed";

            return Response.json(
                {
                    statusCode: 400,
                    message: firstErrorMessage,
                    errors: validationErrors,
                    data: null,
                },
                { status: 400 },
            );
        }

        return Response.json(
            {
                statusCode: 500,
                message: "Error adding transfer",
            },
            { status: 500 },
        );
    }
}