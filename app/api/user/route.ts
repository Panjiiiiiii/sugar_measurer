import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import bcrypt from "bcrypt";

export async function GET() {
    const users = await prisma.user.findMany();
    return Response.json({
        message : "Data fetched successfully",
        data : users
    });
}

export async function POST(request: Request) {
    try {
        const userData: Prisma.userUncheckedCreateInput = await request.json();
        const existingLocation = await prisma.location.findUnique({
            where: { id: userData.location_id },
        });

        if (!existingLocation) {
            return Response.json({
                message: "Location not found",
                data: null,
            }, { status: 404 });
        }
        
        // Hash password using bcrypt
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password as string, 10);
        }
        
        const user = await prisma.user.create({
            data: userData
        });
        return Response.json({
            message : "User created successfully",
            data : user
        });
    } catch (error) {
        return Response.json({
            message : "Error creating user",
            data : error
        });
    }
}