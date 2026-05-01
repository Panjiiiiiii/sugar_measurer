import { prisma } from "@/lib/prisma";

type UpdateOwnerPayload = {
  id?: string;
  nama_owner?: string;
  type_owner?: string;
  type_ownership?: "farmer" | "private" | "special";
  special_price?: number;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owner = await prisma.owner.findUnique({
    where: {
      id,
    },
  });
  console.log(owner);
  if (!owner) {
    return Response.json(
      {
        message: "Owner not found",
        data: null,
      },
      { status: 404 },
    );
  }
  return Response.json(
    {
      statusCode: 200,
      data: owner,
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
    const payload: UpdateOwnerPayload = await request.json();

    const existingOwner = await prisma.owner.findUnique({
      where: { id },
    });

    if (!existingOwner) {
      return Response.json(
        {
          message: "Owner not found",
          data: null,
        },
        { status: 404 },
      );
    }

    if (
      payload.type_ownership === "special" &&
      (payload.special_price === undefined || payload.special_price === null)
    ) {
      return Response.json(
        {
          statusCode: 400,
          message: "Special price is required for special ownership type",
        },
        { status: 400 },
      );
    }

    if (
      payload.type_ownership !== "special" &&
      payload.special_price !== undefined
    ) {
      return Response.json(
        {
          statusCode: 400,
          message:
            "Special price should only be provided for special ownership type",
        },
        { status: 400 },
      );
    }

    await prisma.owner.update({
      where: { id },
      data: {
        name: payload.nama_owner ?? existingOwner.name,
        ownership_type:
          payload.type_ownership ?? existingOwner.ownership_type,
        special_price:
          payload.special_price ?? existingOwner.special_price,
      },
    });

    return Response.json(
      {
        statusCode: 201,
        message: "Owner updated successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error updating owner";

    return Response.json(
      {
        message: errorMessage,
        data: null,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existingOwner = await prisma.owner.findUnique({
      where: { id },
    });
    if (!existingOwner) {
      return Response.json(
        {
          message: "Owner not found",
        },
        { status: 404 },
      );
    }
    await prisma.owner.delete({
      where: { id },
    });
    return Response.json(
      {
        statusCode: 201,
        message: "Owner deleted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        message: "Error deleting owner",
        data: null,
      },
      { status: 500 },
    );
  }
}
