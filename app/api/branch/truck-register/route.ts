import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { validateCreateTruckRegisterInput } from "@/schema/truck";

interface PaginationMeta {
    number_page: number;
    total_page: number;
    total_data: number;
}

function parsePositiveInt(value: string | null, fallback: number) {
    if (!value) return fallback;

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        return fallback;
    }

    return parsed;
}

function getFirstQueryParam(searchParams: URLSearchParams, keys: string[]) {
    for (const key of keys) {
        const value = searchParams.get(key);
        if (value) {
            return value;
        }
    }

    return null;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageParam = getFirstQueryParam(searchParams, ["page", "number_page", "halaman"]);
        const limitParam = getFirstQueryParam(searchParams, ["limit", "per_page", "page_size"]);
        const truckTypeParam = getFirstQueryParam(searchParams, ["type_truck", "truck_type"]);
        const ownershipTypeParam = getFirstQueryParam(searchParams, [
            "type_ownership",
            "ownership_type",
        ]);

        const page = parsePositiveInt(pageParam, 1);
        const limit = parsePositiveInt(limitParam, 10);
        const skip = (page - 1) * limit;

        const truckType = truckTypeParam?.toLowerCase();
        const ownershipType = ownershipTypeParam?.toLowerCase();

        if (truckType && truckType !== "engkel" && truckType !== "double") {
            return Response.json(
                {
                    statusCode: 400,
                    message: "type_truck must be either engkel or double",
                    data: null,
                },
                { status: 400 },
            );
        }

        if (ownershipType && ownershipType !== "farmer" && ownershipType !== "private") {
            return Response.json(
                {
                    statusCode: 400,
                    message: "type_ownership must be either farmer or private",
                    data: null,
                },
                { status: 400 },
            );
        }

        const truckTypeFilter = truckType as "engkel" | "double" | undefined;
        const ownershipTypeFilter = ownershipType as "farmer" | "private" | undefined;

        const whereClause: Prisma.truckWhereInput = {
            ...(truckTypeFilter ? { truck_type: truckTypeFilter } : {}),
            ...(ownershipTypeFilter
                ? {
                      owner: {
                          is: {
                              ownership_type: ownershipTypeFilter,
                          },
                      },
                  }
                : {}),
        };

        const [trucks, totalData] = await Promise.all([
            prisma.truck.findMany({
                where: whereClause,
                include: {
                    owner: true,
                },
                orderBy: {
                    created_at: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.truck.count({
                where: whereClause,
            }),
        ]);

        const totalPage = Math.max(1, Math.ceil(totalData / limit));
        const pagination: PaginationMeta = {
            number_page: page,
            total_page: totalPage,
            total_data: totalData,
        };

        return Response.json({
            statusCode: 200,
            message: "Trucks retrieved successfully",
            data: trucks,
            page: pagination,
        });
    } catch (error) {
        console.error("Error fetching trucks:", error);
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

            if (!newOwner?.nama_owner || !newOwner.type_ownership) {
                return Response.json(
                    {
                        statusCode: 400,
                        message: "New owner data is required",
                        data: null,
                    },
                    { status: 400 },
                );
            }

            const result = await prisma.$transaction(async (tx) => {
                const owner = await tx.owner.create({
                    data: {
                        name: newOwner.nama_owner,
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
