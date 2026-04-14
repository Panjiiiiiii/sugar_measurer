import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import bcrypt from "bcrypt";

interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role: "branch" | "master" | "finance";
    location_id: string;
}

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 10);
    const skip = (page - 1) * limit;

    const [users, totalData] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            orderBy: {
                created_at: "desc",
            },
        }),
        prisma.user.count(),
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
            data: users,
            page: pagination,
        },
        { status: 200 },
    );
}

export async function POST(request: Request) {
    try {
        const userData: CreateUserPayload = await request.json();
        const existingLocation = await prisma.location.findUnique({
            where: { id: userData.location_id },
        });

        if (!existingLocation) {
            return Response.json({
                message: "Location not found",
                data: null,
            }, { status: 404 });
        }
        
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const createUserData: Prisma.userCreateInput = {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            location: {
                connect: {
                    id: userData.location_id,
                },
            },
        };
        
        await prisma.user.create({
            data: createUserData
        });
        return Response.json(
            {
                statusCode: 201,
                message: "User created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        return Response.json({
            message : "Error creating user",
            data : error
        });
    }
}