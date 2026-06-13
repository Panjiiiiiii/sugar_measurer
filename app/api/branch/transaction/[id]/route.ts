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
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            special_price: true,
            ownership_type: true,
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

    const formatTime = (dt: Date | null) =>
      dt
        ? new Date(dt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          })
        : null;
    let data = {
      id: transaction.id,
      bruto: transaction.bruto_weight,
      tare: transaction.tarra_weight,
      netto: transaction.netto_weight,
      total_price: transaction.total_price,
      price: transaction.current_price,
      loading_in: formatTime(transaction.loading_in as Date | null),
      loading_out: formatTime(transaction.loading_out as Date | null),
      truck_id: transaction.truck_id,
      truck: transaction.truck.name,
      driver: transaction.driver_name,
      lisence_plate: transaction.truck.license_plate,
      ownership_type: transaction.owner?.ownership_type,
      owner_id: transaction.owner_id,
      owner_name: transaction.owner?.name,
      owner_special_price: transaction.owner?.special_price,
      owner_is_special_price: transaction.owner?.ownership_type === "special",
      location_id: transaction.location_id,
      location: transaction.location.name,
      payment_method: transaction.payment_method,
      sugar_price: transaction.location.sugar_price,
    };

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
