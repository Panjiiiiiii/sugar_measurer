import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { user_id, endpoint, p256dh, auth } = await request.json();

        if (!user_id || !endpoint || !p256dh || !auth) {
            return Response.json(
                { statusCode: 400, message: "Missing required fields" },
                { status: 400 },
            );
        }

        // Upsert — kalau sudah ada update, kalau belum buat baru
        await prisma.push_subscription.upsert({
            where: { user_id },
            update: { endpoint, p256dh, auth },
            create: { user_id, endpoint, p256dh, auth },
        });

        return Response.json(
            { statusCode: 201, message: "Subscription saved" },
            { status: 201 },
        );
    } catch (error) {
        return Response.json(
            { statusCode: 500, message: "Internal server error" },
            { status: 500 },
        );
    }
}