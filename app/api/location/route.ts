import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function GET() {
    const locations = await prisma.location.findMany();
    return Response.json(
        {
            statusCode: 200,
            data: locations,
        },
        { status: 200 },
    );
}

export async function POST(request: Request) {
    try {
        const locationData: Prisma.locationCreateInput = await request.json();
        const location = await prisma.location.create({
            data: locationData
        });
        return Response.json(
            {
                statusCode: 201,
                message: "Location created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        return Response.json({
            message : "Error creating location",
            data : error
        });
    }
}