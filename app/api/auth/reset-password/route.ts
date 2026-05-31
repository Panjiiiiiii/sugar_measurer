import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, new_password } = await request.json();

    if (!email || !new_password) {
      return Response.json(
        { message: "Email dan password baru wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi password
    const rules = [
      { test: new_password.length >= 8,          msg: "Password minimal 8 karakter" },
      { test: /[0-9]/.test(new_password),         msg: "Password harus mengandung angka" },
      { test: /[A-Z]/.test(new_password),         msg: "Password harus mengandung huruf kapital" },
      { test: /[^a-zA-Z0-9]/.test(new_password),  msg: "Password harus mengandung karakter unik" },
    ];

    const failed = rules.find((r) => !r.test);
    if (failed) {
      return Response.json({ message: failed.msg }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return Response.json({ message: "Email tidak ditemukan" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return Response.json(
      { statusCode: 200, message: "Password berhasil direset" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}