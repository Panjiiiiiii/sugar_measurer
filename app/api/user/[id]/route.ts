import { Prisma } from "@/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      location: {
        include: {
          transactions: true,
        },
      },
    },
  });

  if (!user) {
    return Response.json(
      { message: "User not found", data: null },
      { status: 404 },
    );
  }

  let data = {
    name: user.name,
    email: user.email,
    location: user.location.name,
    transactions: user.location.transactions.map((transaction) => ({
      id: transaction.id,
      date: transaction.transaction_date,
      amount: transaction.total_price,
      status: transaction.status,
    })),
  };

  return Response.json(
    {
      statusCode: 200,
      data: data,
    },
    { status: 200 },
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userData: Partial<Prisma.userUncheckedUpdateInput> =
      await request.json();
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    

    if (!existingUser) {
      return Response.json(
        { message: "User not found", data: null },
        { status: 404 },
      );
    }

    if (userData.location_id && typeof userData.location_id === 'string') {
      const existingLocation = await prisma.location.findUnique({
        where: { id: userData.location_id },
      });
      if (!existingLocation) {
        return Response.json(
          { message: "Location not found", data: null },
          { status: 404 },
        );
      }
    }

      if(userData.password) {
        userData.password = await bcrypt.hash(userData.password as string, 10);
      }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: userData.name ?? existingUser.name,
        email: userData.email ?? existingUser.email,
        location_id: userData.location_id ?? existingUser.location_id,
        password: userData.password ?? existingUser.password,
      },
    });

    return Response.json(
      {
        statusCode: 201,
        message: "User updated successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      { message: "Error updating user", data: null },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return Response.json(
        { message: "User not found", data: null },
        { status: 404 },
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return Response.json(
      {
        statusCode: 201,
        message: "User deleted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      { message: "Error deleting user", data: null },
      { status: 500 },
    );
  }
}
