import { prisma } from "@/lib/prisma";
import { validateCreateTruckRegisterInput } from "@/schema/truck";


export async function POST(request: Request) {
    try {
        const truckData = validateCreateTruckRegisterInput(await request.json());
        const isNewOwner = truckData.isNewOwner === true || truckData.isNewOnwner === true;
        const licensePlate = truckData.no_pol;
        const truckName = truckData.nama_truck;
        const truckType = truckData.type_truck;

        if (!licensePlate) {
            return Response.json(
                {
                    statusCode: 400,
                    message: "License plate is required",
                    data: null,
                },
                { status: 400 },
            );
        }

        const existingTruck = await prisma.truck.findUnique({
            where: { license_plate: licensePlate },
        });

        if (existingTruck) {
            return Response.json(
                {
                    statusCode: 409,
                    message: "License plate already exists",
                    data: null,
                },
                { status: 409 },
            );
        }

        if (isNewOwner) {
            const newOwner = truckData.new_owner;

            if (!newOwner?.nama_owner || !newOwner.account_number || !newOwner.type_ownership) {
                return Response.json(
                    {
                        statusCode: 400,
                        message: "New owner data is required",
                        data: null,
                    },
                    { status: 400 },
                );
            }

            const existingOwnerAccount = await prisma.owner.findUnique({
                where: { account_number: newOwner.account_number },
            });

            if (existingOwnerAccount) {
                return Response.json(
                    {
                        statusCode: 409,
                        message: "Account number already exists",
                        data: null,
                    },
                    { status: 409 },
                );
            }

            const result = await prisma.$transaction(async (tx) => {
                const owner = await tx.owner.create({
                    data: {
                        name: newOwner.nama_owner,
                        account_number: newOwner.account_number,
                        ownership_type: newOwner.type_ownership,
                    },
                });

                const truck = await tx.truck.create({
                    data: {
                        name: truckName,
                        license_plate: licensePlate,
                        owner_id: owner.id,
                        truck_type: truckType,
                    },
                });

                return { owner, truck };
            });

            return Response.json(
                {
                    statusCode: 201,
                    message: "Truck registered successfully",
                },
                { status: 201 },
            );
        }

        if (!truckData.owner_id) {
            return Response.json(
                {
                    statusCode: 400,
                    message: "owner_id is required when isNewOwner is false",
                    data: null,
                },
                { status: 400 },
            );
        }

        const ownerId = truckData.owner_id;

        const result = await prisma.$transaction(async (tx) => {
            const existingOwner = await tx.owner.findUnique({
                where: { id: ownerId },
            });

            if (!existingOwner) {
                return null;
            }

            const truck = await tx.truck.create({
                data: {
                    name: truckName,
                    license_plate: licensePlate,
                    owner_id: ownerId,
                    truck_type: truckType,
                },
            });

            return truck;
        });

        if (!result) {
            return Response.json(
                {
                    statusCode: 404,
                    message: "Owner not found",
                    data: null,
                },
                { status: 404 },
            );
        }

        return Response.json(
            {
                statusCode: 201,
                message: "Truck and owner registered successfully",
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
