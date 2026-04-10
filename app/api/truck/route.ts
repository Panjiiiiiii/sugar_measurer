import { prisma } from "@/lib/prisma";

type CreateTruckPayload = {
    license_plate: string;
    owner_id: string;
    truck_type?: string | null;
};

export async function GET() {
    try {
        const trucks = await prisma.truck.findMany();
        return Response.json(
            {
                statusCode: 200,
                data: trucks,
            },
            { status: 200 },
        );


    } catch (error) {
        return Response.json(
            {
                statusCode: 500,
                message: "Error fetching trucks",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const truckData: CreateTruckPayload = await request.json();
        const existingOwner = await prisma.owner.findUnique({
            where: { id : truckData.owner_id },
        });
        if (!existingOwner) {
            return Response.json(
                {
                    message: "Owner not found",
                    data: null,
                },
                { status: 404 },
            );
        }
        const truck = await prisma.truck.create({
            data: {
                license_plate: truckData.license_plate,
                owner_id: truckData.owner_id,
                truck_type: truckData.truck_type,
            }
        });
        return Response.json(
            {
                statusCode: 201,
                message: "Truck created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        return Response.json(
            {
                statusCode: 500,
                message: "Error creating truck",
                data: error,
            },
            { status: 500 },
        );
    }
}
