import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  

  const location = await prisma.location.findUnique({
    where: {
      id,
    },
  });
  if (!location) {
    return Response.json(
      {
        message: "Location not found",
        data: null,
      },
      { status: 404 },
    );
  }
  return Response.json(
    {
      statusCode: 200,
      data: location,
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

    

    const locationData: Partial<Prisma.locationUncheckedUpdateInput> =
      await request.json();
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });
    if (!existingLocation) {
      return Response.json(
        {
          message: "Location not found",
          data: null,
        },
        { status: 404 },
      );
    }
    await prisma.location.update({
      where: { id },
      data: {
        name: locationData.name ?? existingLocation.name,
        sugar_price: locationData.sugar_price ?? existingLocation.sugar_price,
        account_number:
          locationData.account_number ?? existingLocation.account_number,
        account_balance:
          locationData.account_balance ?? existingLocation.account_balance,
      },
    });
    return Response.json(
      {
        statusCode: 201,
        message: "Lokasi berhasil diperbarui",
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        message: "Error updating location",
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
  const { id } = await params;
  const existingLocation = await prisma.location.findUnique({
    where: { id },
  });
  if (!existingLocation) {
    return Response.json(
      {
        message: "Location not found",
        data: null,
      },
      { status: 404 },
    );
  }
  await prisma.location.delete({
    where: { id },
  });
  return Response.json(
    {
      statusCode: 201,
      message: "Lokasi berhasil dihapus",
    },
    { status: 201 },
  );
}
