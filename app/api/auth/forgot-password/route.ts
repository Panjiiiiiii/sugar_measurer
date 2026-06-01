import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return Response.json({ message: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return Response.json(
        { message: "Email tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json(
      { statusCode: 200, message: "Email ditemukan" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}