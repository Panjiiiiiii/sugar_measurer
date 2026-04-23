import { prisma } from "@/lib/prisma";
import { validateCreateBranchTransactionInputSafe } from "@/schema/transaction";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsedInput = validateCreateBranchTransactionInputSafe(rawBody);

    if (!parsedInput.success) {
      const firstErrorMessage =
        parsedInput.error.issues[0]?.message ?? "Validation failed";

      return Response.json(
        {
          statusCode: 400,
          message: firstErrorMessage,
          data: null,
        },
        { status: 400 },
      );
    }

    const {
      bruto,
      tare,
      loading_in,
      loading_out,
      truck_id,
      location_id,
    } = parsedInput.data;

    const hasTare = tare !== undefined && tare > 0;
    const tareWeight = tare ?? 0;

    if (tareWeight > 0 && !loading_out) {
      return Response.json(
        {
          statusCode: 400,
          message: "loading_out is required when tare is provided",
          data: null,
        },
        { status: 400 },
      );
    }

    const loadingInDate = new Date(loading_in);

    if (Number.isNaN(loadingInDate.getTime())) {
      return Response.json(
        {
          statusCode: 400,
          message: "loading_in must be a valid datetime",
          data: null,
        },
        { status: 400 },
      );
    }

    let loadingOutDate = loadingInDate;

    if (loading_out) {
      loadingOutDate = new Date(loading_out);

      if (Number.isNaN(loadingOutDate.getTime())) {
        return Response.json(
          {
            statusCode: 400,
            message: "loading_out must be a valid datetime",
            data: null,
          },
          { status: 400 },
        );
      }
    }

    if (tareWeight > bruto) {
      return Response.json(
        {
          statusCode: 400,
          message: "tare must be less than or equal to bruto",
          data: null,
        },
        { status: 400 },
      );
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const [location, truck] = await Promise.all([
        tx.location.findUnique({
          where: { id: location_id },
          select: { id: true, sugar_price: true },
        }),
        tx.truck.findUnique({
          where: { id: truck_id },
          select: { id: true },
        }),
      ]);

      if (!location) {
        throw new Error("LOCATION_NOT_FOUND");
      }

      if (!truck) {
        throw new Error("TRUCK_NOT_FOUND");
      }

      const nettoWeight = hasTare ? bruto - tareWeight : 0;
      const totalPrice =
        nettoWeight !== 0 ? nettoWeight * location.sugar_price : 0;

      return tx.transaction.create({
        data: {
          transaction_date: new Date(),
          bruto_weight: bruto,
          tarra_weight: tareWeight,
          netto_weight: nettoWeight,
          total_price: totalPrice,
          status: "unpaid",
          bukti_transfer: "",
          loading_in: loadingInDate,
          loading_out: loadingOutDate,
          location: {
            connect: {
              id: location_id,
            },
          },
          truck: {
            connect: {
              id: truck_id,
            },
          },
        },
      });
    });

    return Response.json(
      {
        statusCode: 201,
        message: "Transaction created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "LOCATION_NOT_FOUND") {
      return Response.json(
        {
          statusCode: 404,
          message: "Location not found",
        },
        { status: 404 },
      );
    }

    if (error instanceof Error && error.message === "TRUCK_NOT_FOUND") {
      return Response.json(
        {
          statusCode: 404,
          message: "Truck not found",
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
