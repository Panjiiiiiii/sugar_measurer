import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await prisma.owner.findUnique({
    where: {
      id,
    },
    include: {
      trucks: true,
    },
  });
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
    const ownerData: Partial<Prisma.ownerUncheckedUpdateInput> =
      await request.json();
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
    const updatedOwner = await prisma.owner.update({
      where: { id },
      data: {   
        name: ownerData.name ?? existingOwner.name,
        ownership_type: ownerData.ownership_type ?? existingOwner.ownership_type,
        account_number: ownerData.account_number ?? existingOwner.account_number,
      }
    });
    return Response.json(
      {
        statusCode: 201,
        message: "Owner updated successfully",
      },
      { status: 201 },
    );
        
  } catch (error) {
    return Response.json(
      {
        message: "Error updating owner",
        data: null,
      },
      { status: 500 },
    );
  }
}
