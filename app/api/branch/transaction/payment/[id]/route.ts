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
                    return Response.json(
                        {
                            statusCode: 400,
                            message: "Transaction not found",
                        },
                        { status: 400 },
                    );
                }

                if (transaction.status === "paid") {
                    return Response.json(
                        {
                            statusCode: 400,
                            message: "Transaction has already been paid",
                        },
                        { status: 400 },
                    );
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