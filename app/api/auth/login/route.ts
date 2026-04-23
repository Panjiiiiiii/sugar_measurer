import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
        {
          message: "Email and password are required",
          data: null,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return Response.json(
        {
          message: "Invalid email or password",
          data: null,
        },
        { status: 401 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response.json(
        {
          message: "Invalid email or password",
          data: null,
        },
        { status: 401 },
      );
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return Response.json(
        {
          message: "JWT secret is not configured",
          data: null,
        },
        { status: 500 },
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
      { expiresIn: "7d" },
    );

    return Response.json(
      {
        statusCode: 201,
        message: "Login successful",
        token: token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      {
        message: "An error occurred during login",
        data: null,
      },
      { status: 500 },
    );
  }
}
