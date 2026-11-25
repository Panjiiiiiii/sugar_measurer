import { prisma } from "@/lib/prisma";
import { getCurrentUserId, logSugarPriceChange } from "@/lib/sugar-price-log";

export async function PUT (request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const existingLocation = await prisma.location.findUnique({
            where: { id },
        });

        if (!existingLocation) {
            return Response.json(
                {
                    message: "Location not found",
                    data: null,
                },
                { status: 404 },
            );
        }

        const userId = await getCurrentUserId();
        const newPrice: number = body.price || existingLocation.sugar_price;

        await prisma.$transaction(async (tx) => {
            await tx.location.update({
                where: { id },
                data: {
                    sugar_price: newPrice,
                },
            });
            await logSugarPriceChange(tx, {
                locationId: id,
                oldPrice: existingLocation.sugar_price,
                newPrice,
                userId,
            });
        });

        return Response.json(
            {
                statusCode: 201,
                message: "Sugar price updated successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        return Response.json(
            {
                statusCode: 500,
                message: "Internal server error",
            },
            { status: 500 },
        );
    }
}