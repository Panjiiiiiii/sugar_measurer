import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const is_read = searchParams.get("is_read");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    if (!user_id) {
      return Response.json({ statusCode: 400, message: "user_id required" }, { status: 400 });
    }

    const where: any = { user_id };

    // Filter is_read: "0" = belum dibaca, "1" = sudah dibaca
    if (is_read !== null && is_read !== "") {
      where.is_read = is_read === "1";
    }

    // Filter tanggal berdasarkan created_at
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at.gte = new Date(start_date);
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return Response.json({ statusCode: 200, data: notifications }, { status: 200 });
  } catch (error) {
    return Response.json({ statusCode: 500, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user_id, date } = await request.json();
    if (!user_id) {
      return Response.json({ statusCode: 400, message: "user_id required" }, { status: 400 });
    }

    const where: any = { user_id };
    if (date) where.created_at = { gte: new Date(date) };

    await prisma.notification.updateMany({ where, data: { is_read: true } });

    return Response.json({ statusCode: 200, message: "Notification updated successfully" }, { status: 200 });
  } catch (error) {
    return Response.json({ statusCode: 500, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user_id, date } = await request.json();
    if (!user_id) {
      return Response.json({ statusCode: 400, message: "user_id required" }, { status: 400 });
    }

    const where: any = { user_id };
    if (date) where.created_at = { gte: new Date(date) };

    await prisma.notification.deleteMany({ where });

    return Response.json({ statusCode: 200, message: "Notification deleted successfully" }, { status: 200 });
  } catch (error) {
    return Response.json({ statusCode: 500, message: "Internal Server Error" }, { status: 500 });
  }
}