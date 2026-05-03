import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        if (!id) {
            return Response.json(
                {
                    statusCode: 400,
                    message: "Transaction id is required",
                    data: null,
                },
                { status: 400 },
            );
        }

        const rawBody = await request.json();
        const { tare, loading_out } = rawBody;

        // Validate required fields
        if (tare === undefined || tare === null || tare === "") {
            return Response.json(
                {
                    statusCode: 400,
                    message: "tare is required",
                    data: null,
                },
                { status: 400 },
            );
        }

        if (!loading_out || typeof loading_out !== "string" || loading_out.trim() === "") {
            return Response.json(
                {
                    statusCode: 400,
                    message: "loading_out is required",
                    data: null,
                },
                { status: 400 },
            );
        }

        const tareWeight = Number(tare);

        if (Number.isNaN(tareWeight) || tareWeight < 0) {
            return Response.json(
                {
                    statusCode: 400,
                    message: "tare must be a non-negative number",
                    data: null,
                },
                { status: 400 },
            );
        }

        const loadingOutDate = new Date(loading_out);

        if (Number.isNaN(loadingOutDate.getTime())) {
            return Response.json(
                {
                    statusCode: 400,
                    message: "loading_out must be a valid datetime",
                    data: null,
                },
                { status: 400 },
            );
        }

        const updatedTransaction = await prisma.$transaction(async (tx) => {
            const existingTransaction = await tx.transaction.findUnique({
                where: { id },
                include: {
                    owner: true,
                }
            });

            if (!existingTransaction) {
                throw new Error("TRANSACTION_NOT_FOUND");
            }

            if (tareWeight > existingTransaction.bruto_weight) {
                throw new Error("TARE_EXCEEDS_BRUTO");
            }

            const location = await tx.location.findUnique({
                where: { id: existingTransaction.location_id },
                select: { sugar_price: true },
            });

            if (!location) {
                throw new Error("LOCATION_NOT_FOUND");
            }

            const nettoWeight = existingTransaction.bruto_weight - tareWeight;
            const totalPrice = nettoWeight * existingTransaction.current_price;

            return tx.transaction.update({
                where: { id },
                data: {
                    tarra_weight: tareWeight,
                    netto_weight: nettoWeight,
                    total_price: totalPrice,
                    loading_out: loadingOutDate,
                    status: existingTransaction.owner?.ownership_type === "private" ? "paid" : "unpaid",
                },
            });
        });

        return Response.json(
            {
                statusCode: 201,
                message: "Transaction out updated successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "TRANSACTION_NOT_FOUND") {
                return Response.json(
                    {
                        statusCode: 404,
                        message: "Transaction not found",
                        data: null,
                    },
                    { status: 404 },
                );
            }

            if (error.message === "TARE_EXCEEDS_BRUTO") {
                return Response.json(
                    {
                        statusCode: 400,
                        message: "tare cannot exceed bruto weight",
                        data: null,
                    },
                    { status: 400 },
                );
            }

            if (error.message === "LOCATION_NOT_FOUND") {
                return Response.json(
                    {
                        statusCode: 404,
                        message: "Location not found",
                        data: null,
                    },
                    { status: 404 },
                );
            }
        }

        return Response.json(
            {
                statusCode: 500,
                message: "Internal server error",
                data: null,
            },
            { status: 500 },
        );
    }
}