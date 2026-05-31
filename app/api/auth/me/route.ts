import { NextRequest } from "next/server";
 
export async function GET(request: NextRequest) {
  // Middleware sudah inject header ini
  const userId       = request.headers.get("x-user-id");
  const role         = request.headers.get("x-user-role");
  const locationId   = request.headers.get("x-user-location-id");
  const email        = request.headers.get("x-user-email");
 
  if (!userId || !role) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
 
  return Response.json({
    statusCode: 200,
    data: {
      id: userId,
      email,
      role,
      location_id: locationId || null,
    },
  });
}
 