import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import bcrypt from "bcrypt";
import { validateCreateUserInput } from "@/schema/user";
import { z } from "zod";



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
    const { searchParams } = new URL(request.url);
    const pageParam = getFirstQueryParam(searchParams, ["page", "number_page", "halaman"]);
    const limitParam = getFirstQueryParam(searchParams, ["limit", "per_page", "page_size"]);
    const page = parsePositiveInt(pageParam, 1);
    const limit = parsePositiveInt(limitParam, 10);
    const skip = (page - 1) * limit;

    const [users, totalData] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            orderBy: {
                created_at: "desc",
            },
            include: {
                location: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
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
        const rawData = await request.json();
        const userData = validateCreateUserInput(rawData);

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
            role: (userData.role === "master" ? "manager" : userData.role) as any,
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
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));
            const firstErrorMessage = validationErrors[0]?.message ?? "Validation failed";
            return Response.json(
                {
                    statusCode: 400,
                    message: firstErrorMessage,
                    errors: validationErrors,
                    data: null,
                },
                { status: 400 },
            );
        }

        if (error instanceof Error && error.message.includes("unique constraint")) {
            return Response.json(
                {
                    statusCode: 409,
                    message: "Email already exists",
                    data: null,
                },
                { status: 409 },
            );
        }

        return Response.json(
            {
                statusCode: 500,
                message: "Error creating user",
                data: null,
            },
            { status: 500 },
        );
    }
}