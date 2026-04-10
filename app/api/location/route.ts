import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function GET() {
    const locations = await prisma.location.findMany();
    return Response.json({
        message : "Data fetched successfully",
        data : locations
    });
}

export async function POST(request: Request) {
    try {
        const locationData: Prisma.locationCreateInput = await request.json();
        const location = await prisma.location.create({
            data: locationData
        });
        return Response.json({
            message : "Location created successfully",
            data : location
        });
    } catch (error) {
        return Response.json({
            message : "Error creating location",
            data : error
        });
    }
}