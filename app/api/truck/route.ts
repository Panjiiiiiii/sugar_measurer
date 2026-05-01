import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { validateCreateTruckInput } from "@/schema/truck";

interface PaginationMeta {
    number_page: number;
    total_page: number;
    total_data: number;
}

function parsePositiveInt(value: string | null, fallback: number) {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : Math.max(1, parsed);
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
        const whereClause: Prisma.truckWhereInput = {};
        if (truckType) {
            whereClause.truck_type = truckType;
        }
        const [trucks, totalData] = await Promise.all([
            prisma.truck.findMany({
                where: whereClause, 
                skip,
                take: limit,
                orderBy: {
                    created_at: "desc",
                },
            }),
            prisma.truck.count({ where: whereClause }),
        ]);
        const totalPage = Math.max(1, Math.ceil(totalData / limit));    
        const pagination: PaginationMeta = {
            number_page: page,
            total_page: totalPage,
            total_data: totalData,
        };
        return Response.json(
            {
                statusCode: 200,
                data: trucks,
                page: pagination,
            },
            { status: 200 },
        );
    } catch (error) {
        return Response.json(
            {
                message: "Error fetching data",
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request: Request) {
    try {
        const rawData = await request.json();
        const truckData = validateCreateTruckInput(rawData);
        const truck = await prisma.truck.create({
            data: truckData as unknown as Prisma.truckCreateInput,
        });
        return Response.json(
            {
                statusCode: 201,
                message: "Truck created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error creating truck:", error);
        return Response.json(
            {
                statusCode: 500,
                message: "Internal server error",
            },
            { status: 500 },
        );
    }
}