import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateTruckSchema = z.object({
  license_plate: z.string().min(1, "License plate is required").max(255).trim().optional(),
  name: z.string().max(255, "Truck name must not exceed 255 characters").trim().optional(),
  truck_type: z.enum(["engkel", "double"]).nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rawData = await request.json();
    const payload = UpdateTruckSchema.parse(rawData);

    const truck = await prisma.truck.findUnique({
      where: { id },
    });

    if (!truck) {
      return Response.json(
        {
          statusCode: 404,
          message: "Truck not found",
          data: null,
        },
        { status: 404 },
      );
    }

    const updatedTruck = await prisma.truck.update({
      where: { id },
      data: {
        license_plate: payload.license_plate ?? truck.license_plate,
        name: payload.name ?? truck.name,
        truck_type: payload.truck_type ?? truck.truck_type,
      },
    });

    return Response.json(
      {
        statusCode: 200,
        message: "Truck updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstErrorMessage = error.issues[0]?.message ?? "Validation failed";
      return Response.json(
        {
          statusCode: 400,
          message: firstErrorMessage,
          data: null,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        statusCode: 500,
        message: "Error updating truck",
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

    const truck = await prisma.truck.findUnique({
      where: { id },
    });

    if (!truck) {
      return Response.json(
        {
          statusCode: 404,
          message: "Truck not found",
        },
        { status: 404 },
      );
    }

    await prisma.truck.delete({
      where: { id },
    });

    return Response.json(
      {
        statusCode: 200,
        message: "Truck deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        statusCode: 500,
        message: "Error deleting truck",
      },
      { status: 500 },
    );
  }
}
