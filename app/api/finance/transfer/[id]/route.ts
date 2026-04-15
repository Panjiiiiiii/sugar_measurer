import { prisma } from "@/lib/prisma";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

type TransferPayload = {
    amount?: number;
    bukti_transfer?: string;
};

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

function decodeBase64File(base64Input: string) {
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: locationId } = await params;
        const payload: TransferPayload = await request.json();
        const amount = Number(payload.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return Response.json(
                {
                    message: "Invalid transfer amount",
                    data: null,
                },
                { status: 400 },
            );
        }

        if (!payload.bukti_transfer) {
            return Response.json(
                {
                    message: "bukti_transfer is required",
                    data: null,
                },
                { status: 400 },
            );
        }

        const decodedFile = decodeBase64File(payload.bukti_transfer);

        if (!decodedFile) {
            return Response.json(
                {
                    message: "Invalid bukti_transfer base64 format",
                    data: null,
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
                        bukti_transfer: publicFilePath,
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
        return Response.json(
            {
                statusCode: 500,
                message: "Error adding transfer",
            },
            { status: 500 },
        );
    }
}