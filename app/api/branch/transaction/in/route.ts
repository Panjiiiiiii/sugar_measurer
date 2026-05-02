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

    let {
      bruto_weight,
      tarra_weight,
      loading_in,
      loading_out,
      truck_id,
      location_id,
      user_id,
      owner_id,
      driver_name,
      sugar_price,
    } = parsedInput.data;

    const hasTare = tarra_weight !== undefined && tarra_weight > 0;
    const tareWeight = tarra_weight ?? 0;
    const hasLoadingOut = typeof loading_out === "string" && loading_out.trim() !== "" && loading_out !== "0";
    const transactionStatus = hasTare && hasLoadingOut ? "unpaid" : "queue";

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

    if (hasLoadingOut) {
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

    if (tareWeight > bruto_weight) {
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
      const [location, truck, owner] = await Promise.all([
        tx.location.findUnique({
          where: { id: location_id },
          select: { id: true, sugar_price: true },
        }),
        tx.truck.findUnique({
          where: { id: truck_id },
          select: { id: true },
        }),
        tx.owner.findUnique({
          where: { id: owner_id },
          select: { id: true },
        }),
      ]);

      if (!location) {
      throw new Error("LOCATION_NOT_FOUND");
      }

      if (!truck) {
      throw new Error("TRUCK_NOT_FOUND");
      }

      if (!owner) {
      throw new Error("OWNER_NOT_FOUND");
      }

      const nettoWeight = hasTare ? bruto_weight - tareWeight : 0;

      let specialOwner = await tx.owner.findFirst({
        where: {
          id: owner_id,
          status : "special",
        },
        select : {
          special_price : true
        }
      });

      const resolvedSugarPrice =
        sugar_price ?? specialOwner?.special_price ?? location.sugar_price;
      
      const totalPrice =
        nettoWeight !== 0 ? nettoWeight * resolvedSugarPrice : 0;

      return tx.transaction.create({
        data: {
          transaction_date: new Date(),
          bruto_weight: bruto_weight,
          tarra_weight: tareWeight,
          netto_weight: nettoWeight,
          current_price: resolvedSugarPrice,
          driver_name: driver_name,
          total_price: totalPrice,
        status: transactionStatus,
          payment_method: "cash",
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
          owner: {
            connect: {
              id: owner_id,
            },
          },
          user: {
            connect: {
              id: user_id,
            },
          }
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

    if (error instanceof Error && error.message === "OWNER_NOT_FOUND") {
      return Response.json(
      {
        statusCode: 404,
        message: "Owner not found",
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
