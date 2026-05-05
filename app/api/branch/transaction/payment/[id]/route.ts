import { prisma } from "@/lib/prisma";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE64_PATTERN = /^data:([^;]+);base64,([A-Za-z0-9+/=\s]+)$/;

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

function normalizeMimeType(rawMimeType?: string) {
    if (!rawMimeType) {
        return "application/octet-stream";
    }

    const mimeType = rawMimeType.trim().toLowerCase();

    if (mimeType === "@file/png" || mimeType === "file/png" || mimeType === "png") {
        return "image/png";
    }

    if (mimeType === "@file/jpg" || mimeType === "@file/jpeg" || mimeType === "file/jpg" || mimeType === "file/jpeg") {
        return "image/jpeg";
    }

    if (mimeType === "@file/webp" || mimeType === "file/webp") {
        return "image/webp";
    }

    if (mimeType === "@file/pdf" || mimeType === "file/pdf") {
        return "application/pdf";
    }

    if (mimeType.startsWith("@file/")) {
        const fileType = mimeType.slice("@file/".length);
        return normalizeMimeType(fileType);
    }

    if (mimeType.startsWith("file/")) {
        const fileType = mimeType.slice("file/".length);
        return normalizeMimeType(fileType);
    }

    return mimeType;
}

function detectMimeTypeFromBuffer(buffer: Buffer) {
    if (buffer.length >= 8) {
        const isPng =
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47 &&
            buffer[4] === 0x0d &&
            buffer[5] === 0x0a &&
            buffer[6] === 0x1a &&
            buffer[7] === 0x0a;

        if (isPng) {
            return "image/png";
        }
    }

    if (buffer.length >= 3) {
        const isJpeg =
            buffer[0] === 0xff &&
            buffer[1] === 0xd8 &&
            buffer[2] === 0xff;

        if (isJpeg) {
            return "image/jpeg";
        }
    }

    if (buffer.length >= 12) {
        const isWebp =
            buffer.toString("ascii", 0, 4) === "RIFF" &&
            buffer.toString("ascii", 8, 12) === "WEBP";

        if (isWebp) {
            return "image/webp";
        }
    }

    if (buffer.length >= 4) {
        const isPdf =
            buffer.toString("ascii", 0, 4) === "%PDF";

        if (isPdf) {
            return "application/pdf";
        }
    }

    return "application/octet-stream";
}

function decodeBase64File(base64Input: string) {
    const trimmedInput = base64Input.trim();
    const matched = trimmedInput.match(BASE64_PATTERN);
    const rawMimeType = matched?.[1];
    const base64Data = matched?.[2] ?? trimmedInput;

    try {
        const normalizedBase64 = base64Data.replace(/\s/g, "");
        const buffer = Buffer.from(normalizedBase64, "base64");

        if (!buffer.byteLength) {
            return null;
        }

        const normalizedMimeType = normalizeMimeType(rawMimeType);
        const finalMimeType =
            normalizedMimeType !== "application/octet-stream"
                ? normalizedMimeType
                : detectMimeTypeFromBuffer(buffer);

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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: transactionId } = await params;

        const { status, payment_method } = await request.json();

        if (!transactionId) {
            return Response.json(
                {
                    statusCode: 400,
                    message: "Transaction id is required",
                    data: null,
                },
                { status: 400 },
            );
        }

        try {
            await prisma.$transaction(async (tx) => {
                const transaction = await tx.transaction.findUnique({
                    where: { id: transactionId },
                });

                if (!transaction) {
                    throw new Error("TRANSACTION_NOT_FOUND");
                }

                if (transaction.status === "paid") {
                    throw new Error("TRANSACTION_ALREADY_PAID");
                }

                tx.transaction.update({
                    where: { id: transactionId },
                    data: {
                        status: status,
                        payment_method : payment_method
                    },
                });

                const existingLocation = await tx.location.findUnique({
                    where: { id: transaction.location_id },
                });

                if (!existingLocation) {
                    return Response.json(
                        {
                            statusCode: 400,
                            message: "Location not found",
                        },
                        { status: 400 },
                    );
                }

                let amountLocation : number = existingLocation.account_balance ?? 0;

                let amountTransaction : number = transaction.total_price ?? 0;

                if(amountLocation < amountTransaction){
                    return Response.json(
                        {
                            statusCode: 400,
                            message: "Insufficient balance in location",
                        },
                        { status: 400 },
                    );
                }

                tx.logTransfer.create({
                    data: {
                        transaction_id: transactionId,
                        user_id: transaction.user_id,
                        transfer_amount: transaction.total_price ?? 0,
                        transfer_status : "out",
                        bukti_transfer : ""
                    },
                });

                tx.location.update({
                    where: { id: transaction.location_id },
                    data: {
                        account_balance: {
                            decrement: transaction.total_price ?? 0,
                        },
                    },
                });
            });
        } catch (dbError) {
            return Response.json(
                {
                    statusCode: 500,
                    message : dbError
                },
                { status: 500 },
            );
        }
        return Response.json(
            {
                statusCode: 200,
                message: "Transaction payment recorded successfully",
            },
            { status: 200 },
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "TRANSACTION_NOT_FOUND") {
                return Response.json(
                    {
                        statusCode: 400,
                        message: "Transaction not found",
                    },
                    { status: 400 },
                );
            }

            if (error.message === "TRANSACTION_ALREADY_PAID") {
                return Response.json(
                    {
                        statusCode: 400,
                        message: "Transaction has already been paid",
                    },
                    { status: 400 },
                );
            }
        }

        return Response.json(
            {
                statusCode: 500,
                message: "Internal server error",
                error: error instanceof Error ? error.message : String(error),                
            },
            { status: 500 },
        );
    }
}