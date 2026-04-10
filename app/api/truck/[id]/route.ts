import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const truck = await prisma.truck.findUnique({
        where: { id },
        include: {
            owner: true,
        },
    });
    if (!truck) {
        return Response.json(
            {
                message: "Truck not found",
                data: null,
            },
            { status: 404 },
        );
    }
    return Response.json(
        {
            statusCode: 200,
            data: truck,
        },
        { status: 200 },
    );
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const truckData: Partial<{ license_plate: string; owner_id: string; truck_type: string | null }> =
            await request.json();
        const existingTruck = await prisma.truck.findUnique({
            where: { id },
        });
        if (!existingTruck) {
            return Response.json(
                {
                    message: "Truck not found",
                    data: null,
                },
                { status: 404 },
            );
        }
        const existingOwner = await prisma.owner.findUnique({
            where: { id: truckData.owner_id ?? existingTruck.owner_id },
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
        const updatedTruck = await prisma.truck.update({
            where: { id },
            data: {
                license_plate: truckData.license_plate ?? existingTruck.license_plate,
                owner_id: truckData.owner_id ?? existingTruck.owner_id,
                truck_type: truckData.truck_type ?? existingTruck.truck_type,
            },
        });
        return Response.json(
            {
                statusCode: 201,
                message: "Truck updated successfully",
                data: updatedTruck,
            },
            { status: 201 },
        );
    } catch (error) {
        return Response.json(
            {
                statusCode: 500,
                message: "Error updating truck",
                data: error,
            },
            { status: 500 },
        );
    }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const existingTruck = await prisma.truck.findUnique({
            where: { id },
        });
        if (!existingTruck) {
            return Response.json(
                {
                    message: "Truck not found",
                    data: null,
                },
                { status: 404 },
            );
        }
        await prisma.truck.delete({
            where: { id },
        });
        return Response.json(
            {
                statusCode: 201,
                message: "Truck deleted successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        return Response.json(
            {
                statusCode: 500,
                message: "Error deleting truck",
                data: error,
            },
            { status: 500 },
        );
    }
}