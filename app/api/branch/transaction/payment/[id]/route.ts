import { sendNotification } from "@/lib/notification";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: transactionId } = await params;
        const { status, payment_method } = await request.json();

        if (!transactionId) {
            return Response.json(
                { statusCode: 400, message: "Transaction id is required", data: null },
                { status: 400 },
            );
        }

        // Simpan hasil transaksi untuk dipakai di notif
        let updatedBalance = 0;
        let locationName = "";

        await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id: transactionId },
            });

            if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");
            if (transaction.status === "paid") throw new Error("TRANSACTION_ALREADY_PAID");

            await tx.transaction.update({
                where: { id: transactionId },
                data: { status, payment_method },
            });

            const existingLocation = await tx.location.findUnique({
                where: { id: transaction.location_id },
            });

            if (!existingLocation) throw new Error("LOCATION_NOT_FOUND");

            const amountLocation = existingLocation.account_balance ?? 0;
            const amountTransaction = transaction.total_price ?? 0;

            if (amountLocation < amountTransaction) throw new Error("INSUFFICIENT_BALANCE");

            await tx.logTransfer.create({
                data: {
                    transaction_id: transactionId,
                    user_id: transaction.user_id,
                    transfer_amount: transaction.total_price ?? 0,
                    transfer_status: "out",
                    location_id: transaction.location_id,
                    bukti_transfer: "",
                },
            });

            const updated = await tx.location.update({
                where: { id: transaction.location_id },
                data: {
                    account_balance: {
                        decrement: transaction.total_price ?? 0,
                    },
                },
            });

            // Simpan untuk notif
            updatedBalance = updated.account_balance ?? 0;
            locationName = existingLocation.name;
        });

        // Query semua finance + manager
        const recipients = await prisma.user.findMany({
            where: { role: { in: ["finance", "manager"] } },
            select: { id: true },
        });

        const userIds = recipients.map((u) => u.id);

        await sendNotification({
            userIds,
            type: "transaction_out",
            title: `Transaksi keluar - ${locationName}`,
            description: `Saldo lokasi ${locationName} sekarang Rp ${updatedBalance.toLocaleString("id-ID")}`,
            url: "/finance/notification",
        });

        return Response.json(
            { statusCode: 201, message: "Status transaksi berhasil diperbarui" },
            { status: 201 },
        );

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "TRANSACTION_NOT_FOUND")
                return Response.json({ statusCode: 400, message: "Transaction not found" }, { status: 400 });
            if (error.message === "TRANSACTION_ALREADY_PAID")
                return Response.json({ statusCode: 400, message: "Transaction has already been paid" }, { status: 400 });
            if (error.message === "LOCATION_NOT_FOUND")
                return Response.json({ statusCode: 400, message: "Location not found" }, { status: 400 });
            if (error.message === "INSUFFICIENT_BALANCE")
                return Response.json({ statusCode: 400, message: "Insufficient balance in location" }, { status: 400 });
        }

        return Response.json(
            { statusCode: 500, message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}