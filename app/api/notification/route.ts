import { prisma } from "@/lib/prisma";
import { date } from "zod";

export async function GET(request: Request) {
  try {
    const {user_id} = await request.json();
    const notifications = await prisma.notification.findMany({
        orderBy: { created_at: "desc" },
        where: { user_id },
    })
    return Response.json(
        { statusCode: 200, data: notifications },
        { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { statusCode: 500, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
    try {
        const { user_id, date } = await request.json();
        await prisma.notification.updateMany({
            where: { user_id },
            data: { is_read: true },
        });

        if (date) {
            await prisma.notification.updateMany({
                where: { user_id, created_at: { gte: new Date(date) } },
                data: { is_read: true },
            });
        }
        return Response.json(
            { statusCode: 200, message: "Notification updated successfully" },
            { status: 200 },
        );
    } catch (error) {
        return Response.json(
            { statusCode: 500, message: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { user_id } = await request.json();
        await prisma.notification.deleteMany({
            where: { user_id },
        });
        return Response.json(
            { statusCode: 200, message: "Notification deleted successfully" },
            { status: 200 },
        );
    } catch (error) {
        return Response.json(
            { statusCode: 500, message: "Internal Server Error" },
            { status: 500 },
        );
    }
}