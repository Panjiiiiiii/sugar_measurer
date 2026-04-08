import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

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
  return Response.json({
    message: "Data fetched successfully",
    data: location,
  });
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
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name: locationData.name ?? existingLocation.name,
        sugar_price: locationData.sugar_price ?? existingLocation.sugar_price,
      },
    });
    return Response.json({
      message: "Location updated successfully",
      data: updatedLocation,
    });
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
  return Response.json({
    message: "Location deleted successfully",
    data: null,
  });
}
