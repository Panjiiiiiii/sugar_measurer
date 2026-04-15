import { prisma } from "@/lib/prisma";

type UpdateOwnerPayload = {
  owner?: {
    id?: string;
    nama_owner?: string;
    type_owner?: string;
    account_number?: string;
    type_ownership?: "farmer" | "private";
  };
  data_truck?: Array<{
    id?: string;
    nama?: string;
    type_truck?: string;
    no_pol?: string;
    nama_truck?: string;
    is_deleted?: boolean;
  }>;
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
    include: {
      trucks: true,
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

    const trucksPayload = Array.isArray(payload.data_truck)
      ? payload.data_truck
      : [];

    if (trucksPayload.some((truck) => !truck.id && !truck.no_pol)) {
      return Response.json(
        {
          message: "Truck without id must include no_pol",
          data: null,
        },
        { status: 400 },
      );
    }

    // Check for duplicate no_pol in payload
    const nopolsInPayload = trucksPayload
      .filter((truck) => truck.no_pol && !truck.is_deleted)
      .map((truck) => truck.no_pol!.toUpperCase());
    
    const duplicateNopol = nopolsInPayload.find((nopol, index) => nopolsInPayload.indexOf(nopol) !== index);
    if (duplicateNopol) {
      return Response.json(
        {
          statusCode: 400,
          message: `Duplicate license plate in request: ${duplicateNopol}`,
          data: null,
        },
        { status: 400 },
      );
    }

    // Check for duplicate no_pol in existing trucks (excluding deleted ones)
    const existingTrucks = await prisma.truck.findMany({
      where: { owner_id: id },
    });

    const truckIdsBeingUpdated = new Set(
      trucksPayload.filter((t) => t.id && !t.is_deleted).map((t) => t.id),
    );

    const existingNopols = existingTrucks
      .filter((truck) => !truckIdsBeingUpdated.has(truck.id))
      .map((truck) => truck.license_plate.toUpperCase());

    const conflictingNopol = nopolsInPayload.find((nopol) => existingNopols.includes(nopol));
    if (conflictingNopol) {
      return Response.json(
        {
          statusCode: 409,
          message: `License plate already exists: ${conflictingNopol}`,
          data: null,
        },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedOwner = await tx.owner.update({
        where: { id },
        data: {
          name: payload.owner?.nama_owner ?? existingOwner.name,
          ownership_type:
            payload.owner?.type_ownership ?? existingOwner.ownership_type,
          account_number:
            payload.owner?.account_number ?? existingOwner.account_number,
        },
      });

      let updatedTruckCount = 0;
      let createdTruckCount = 0;
      let deletedTruckCount = 0;

      for (const truck of trucksPayload) {
        if (truck.id) {
          if (truck.is_deleted === true) {
            const existingTruck = await tx.truck.findFirst({
              where: {
                id: truck.id,
                owner_id: id,
              },
            });

            if (!existingTruck) {
              throw new Error(`Truck with id ${truck.id} not found for this owner`);
            }

            await tx.truck.delete({
              where: { id: truck.id },
            });

            deletedTruckCount += 1;
            continue;
          }

          const existingTruck = await tx.truck.findFirst({
            where: {
              id: truck.id,
              owner_id: id,
            },
          });

          if (!existingTruck) {
            throw new Error(`Truck with id ${truck.id} not found for this owner`);
          }

          await tx.truck.update({
            where: { id: truck.id },
            data: {
              name: truck.nama_truck ?? existingTruck.name,
              license_plate: truck.no_pol ?? existingTruck.license_plate,
              truck_type: truck.type_truck ?? existingTruck.truck_type,
            },
          });

          updatedTruckCount += 1;
          continue;
        }

        await tx.truck.create({
          data: {
            owner_id: id,
            name: truck.nama_truck || truck.nama,
            license_plate: truck.no_pol!,
            truck_type: truck.type_truck,
          },
        });

        createdTruckCount += 1;
      }

      return {
        owner: updatedOwner,
        updated_truck: updatedTruckCount,
        created_truck: createdTruckCount,
        deleted_truck: deletedTruckCount,
      };
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
          data: null,
        },        { status: 404 },
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