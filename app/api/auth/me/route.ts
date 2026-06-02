import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
 
export async function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
    const role = request.headers.get("x-user-role") || "manager";
    return Response.json({
      statusCode: 200,
      data: {
        id: "mock-user-id",
        name: "Emirhan Boruch",
        email: "emirhan@example.com",
        role: role,
        location_id: "07bf151f-ed44-4a5d-96cb-afed7e087c7a",
      },
    });
  }

  const userId = request.headers.get("x-user-id");
 
  if (!userId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      location_id: true,
    },
  });

  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
 
  return Response.json({
    statusCode: 200,
    data: user,
  });
}
 