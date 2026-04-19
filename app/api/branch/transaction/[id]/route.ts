import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        {
          statusCode: 400,
          message: "Transaction id is required",
        },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        truck: {
          select: {
            id: true,
            license_plate: true,
            name: true,
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        location: true,
      },
    });

    if (!transaction) {
      return Response.json(
        {
          statusCode: 404,
          message: "Transaction not found",
          data: null,
        },
        { status: 404 },
      );
    }

    let data = {
        id : transaction.id,
        bruto : transaction.bruto_weight,
        tare : transaction.tarra_weight,
        netto : transaction.netto_weight,
        total_price : transaction.total_price,
        loading_in : transaction.loading_in,
        loading_out : transaction.loading_out,
        truck_id : transaction.truck_id,
        truck : transaction.truck.name,
        lisence_plate : transaction.truck.license_plate,
        location_id : transaction.location_id,
        location : transaction.location.name,
        sugar_price : transaction.location.sugar_price,
    }

    return Response.json(
      {
        statusCode: 200,
        message: "Transaction fetched successfully",
        data: data,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
