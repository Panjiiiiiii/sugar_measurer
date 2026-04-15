import { prisma } from "@/lib/prisma";

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

        const updatedLocation = await prisma.location.update({
            where: { id },
            data: {
                sugar_price: body.price || existingLocation.sugar_price,
            },
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