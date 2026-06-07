import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password
    ) {
      return Response.json(
        { message: "Email and password are required", data: null },
        { status: 400 }
      );
    }

    if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
      const mockUsers: Record<string, any> = {
        "branch@example.com": { id: "user-1", name: "Admin Cabang", email: "branch@example.com", role: "operator", location_id: "loc-1" },
        "finance@example.com": { id: "user-2", name: "Admin Keuangan", email: "finance@example.com", role: "finance", location_id: "loc-2" },
        "manager@example.com": { id: "user-3", name: "Manager", email: "manager@example.com", role: "manager", location_id: "loc-3" },
      };

      if (mockUsers[email] && password === "Password123") {
        const user = mockUsers[email];
        const jwtSecret = process.env.JWT_SECRET || "fallback_secret_for_dev_bypass_123456789";
        const token = jwt.sign(
          {
            sub: user.id,
            email: user.email,
            role: user.role,
            location_id: user.location_id,
          },
          jwtSecret,
          { expiresIn: "7d" }
        );
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
        return Response.json({
          statusCode: 200,
          message: "Login successful (Bypass Dev Mode)",
          data: user,
        });
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return Response.json(
        { message: "Invalid email or password", data: null },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response.json(
        { message: "Invalid email or password", data: null },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return Response.json(
        { message: "JWT secret is not configured", data: null },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        location_id: user.location_id,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Set httpOnly cookie — aman dari XSS
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    // Return info user (tanpa token di body) untuk keperluan redirect di client
    return Response.json(
      {
        statusCode: 200,
        message: "Login successful",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          location_id: user.location_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { message: "An error occurred during login", data: null },
      { status: 500 }
    );
  }
}