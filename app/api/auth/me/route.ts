import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
 
export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
 
  if (!userId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
    const mockUsers: Record<string, any> = {
      "user-1": { id: "user-1", name: "Admin Cabang", email: "branch@example.com", role: "operator", location_id: "loc-1" },
      "user-2": { id: "user-2", name: "Admin Keuangan", email: "finance@example.com", role: "finance", location_id: "loc-2" },
      "user-3": { id: "user-3", name: "Manager", email: "manager@example.com", role: "manager", location_id: "loc-3" },
    };
    if (mockUsers[userId]) {
      return Response.json({
        statusCode: 200,
        data: mockUsers[userId],
      });
    }
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
 