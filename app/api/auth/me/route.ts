import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
 
export async function GET(request: NextRequest) {
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
 