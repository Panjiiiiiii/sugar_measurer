import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type ProfilePayload = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ProfilePayload;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email) {
      return Response.json(
        { message: "Nama dan email wajib diisi" },
        { status: 400 }
      );
    }

    const existingEmailOwner = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (existingEmailOwner) {
      return Response.json(
        { message: "Email sudah digunakan pengguna lain" },
        { status: 409 }
      );
    }

    const dataToUpdate: {
      name: string;
      email: string;
      password?: string;
    } = {
      name,
      email,
    };

    if (password) {
      const rules = [
        { test: password.length >= 8, msg: "Password minimal 8 karakter" },
        { test: /[0-9]/.test(password), msg: "Password harus mengandung angka" },
        { test: /[A-Z]/.test(password), msg: "Password harus mengandung huruf kapital" },
        { test: /[^a-zA-Z0-9]/.test(password), msg: "Password harus mengandung karakter unik" },
      ];

      const failed = rules.find((rule) => !rule.test);
      if (failed) {
        return Response.json({ message: failed.msg }, { status: 400 });
      }

      dataToUpdate.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        location_id: true,
      },
    });

    return Response.json(
      {
        statusCode: 200,
        message: "Profile berhasil diperbarui",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
