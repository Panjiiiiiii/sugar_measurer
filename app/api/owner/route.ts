import { prisma } from "@/lib/prisma";

type CreateOwnerWithTrucksPayload = {
  owner: {
    nama_owner: string;
    type_owner?: string;
    account_number: string;
    type_ownership: "farmer" | "private";
  };
  data_truck: Array<{
    nama_truck?: string;
    type_truck?: "engkel" | "double";
    no_pol: string;
  }>;
};

interface PaginationMeta {
  number_page: number;
  total_page: number;
  total_data: number;
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function getFirstQueryParam(searchParams: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) {
      return value;
    }
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = getFirstQueryParam(searchParams, ["page", "number_page", "halaman"]);
    const limitParam = getFirstQueryParam(searchParams, ["limit", "per_page", "page_size"]);
    const page = parsePositiveInt(pageParam, 1);
    const limit = parsePositiveInt(limitParam, 10);
    const skip = (page - 1) * limit;

    const [owners, totalData] = await Promise.all([
      prisma.owner.findMany({
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.owner.count(),
    ]);

    const totalPage = Math.max(1, Math.ceil(totalData / limit));
    const pagination: PaginationMeta = {
      number_page: page,
      total_page: totalPage,
      total_data: totalData,
    };

    return Response.json(
      {
        statusCode: 200,
        data: owners,
        page: pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        message: "Error fetching data",
        data: null,
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload: CreateOwnerWithTrucksPayload = await request.json();

    if (!payload.owner || !payload.owner.nama_owner || !payload.owner.account_number || !payload.owner.type_ownership) {
      return Response.json(
        {
          message: "Invalid owner payload",
          data: null,
        },
        { status: 400 },
      );
    }

    const trucksPayload = Array.isArray(payload.data_truck) ? payload.data_truck : [];

    if (trucksPayload.some((truck) => !truck.no_pol)) {
      return Response.json(
        {
          message: "Each truck must include no_pol",
          data: null,
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.owner.create({
        data: {
          name: payload.owner.nama_owner,
          account_number: payload.owner.account_number,
          ownership_type: payload.owner.type_ownership,
        },
      });

      if (trucksPayload.length > 0) {
        await tx.truck.createMany({
          data: trucksPayload.map((truck) => ({
            owner_id: owner.id,
            license_plate: truck.no_pol,
            truck_type: truck.type_truck,
            name: truck.nama_truck,
          })),
        });
      }

      return {
        owner,
        totalTruckCreated: trucksPayload.length,
      };
    });

    return Response.json(
      {
        statusCode: 201,
        message: "Owner created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        message: "Error creating owner",
        data: error,
      },
      {
        status: 500,
      },
    );
  }
}
