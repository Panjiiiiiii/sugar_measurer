import { prisma } from "@/lib/prisma";
import { validateCreateTransferInput } from "@/schema/transfer";
import { z } from "zod";
import { sendNotification } from "@/lib/notification";
import { storeFile } from "@/lib/storage";

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
        if (!buffer.byteLength) return null;
        return { mimeType: finalMimeType, buffer };
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
            return Response.json({ message: "Invalid bukti transfer base64 format" }, { status: 400 });
        }

        const extension = getExtensionFromMimeType(decodedFile.mimeType);
        const relativeDirectory = "finance/transfer";
        const transferTimestamp = formatTransferTimestamp(new Date());
        const fileName = `${locationId}-${transferTimestamp}.${extension}`;

        const stored = await storeFile(decodedFile.buffer, decodedFile.mimeType, relativeDirectory, fileName);
        const publicFilePath = stored.url;

        // Simpan untuk notif
        let updatedBalance = 0;
        let locationName = "";

        try {
            const transactionResult = await prisma.$transaction(async (tx) => {
                const existingLocation = await tx.location.findUnique({
                    where: { id: locationId },
                });
                if (!existingLocation) return null;

                const updatedLocation = await tx.location.update({
                    where: { id: existingLocation.id },
                    data: { account_balance: { increment: amount } },
                });

                const transferLog = await tx.logTransfer.create({
                    data: {
                        location_id: existingLocation.id,
                        user_id: payload.user_id,
                        bukti_transfer: publicFilePath ?? "cash",
                        transfer_status: "in",
                        transfer_amount: amount,
                    },
                });

                updatedBalance = updatedLocation.account_balance ?? 0;
                locationName = existingLocation.name;

                return { updatedLocation, transferLog };
            });

            if (!transactionResult) {
                return Response.json({ message: "Location not found", data: null }, { status: 404 });
            }
        } catch (dbError) {
            await stored.delete();
            throw dbError;
        }

        const recipients = await prisma.user.findMany({
            where: {
                OR: [
                    { role: "operator", location_id: locationId },
                    { role: "manager" },
                ],
            },
            select: { id: true },
        });

        const userIds = recipients.map((u) => u.id);

        await sendNotification({
            userIds,
            type: "transaction_in",
            title: `Top up masuk - ${locationName}`,
            description: `Saldo lokasi ${locationName} sekarang Rp ${updatedBalance.toLocaleString("id-ID")}`,
            url: "/manager/notification",
        });

        return Response.json(
            { statusCode: 201, message: "Transfer added successfully" },
            { status: 201 },
        );

    } catch (error) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            return Response.json(
                { statusCode: 400, message: validationErrors[0]?.message ?? "Validation failed", errors: validationErrors, data: null },
                { status: 400 },
            );
        }

        console.error("Error processing transfer:", error);

        return Response.json({ statusCode: 500, message: "Error adding transfer" }, { status: 500 });
    }
}