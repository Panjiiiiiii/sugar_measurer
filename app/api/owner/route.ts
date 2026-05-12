import { Prisma } from "@/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { validateCreateOwnerInput } from "@/schema/owner";
import { z } from "zod";

interface PaginationMeta {
  per_page: number;
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
    const ownershipTypeParam = getFirstQueryParam(searchParams, ["type_ownership", "ownership_type"]);
    const searchParam = getFirstQueryParam(searchParams, ["search", "q", "name"]);
    const page = parsePositiveInt(pageParam, 1);
    const limit = parsePositiveInt(limitParam, 10);
    const skip = (page - 1) * limit;
    const search = searchParam?.trim();

    const whereClause: Prisma.ownerWhereInput = {};
    if (ownershipTypeParam) {
      whereClause.ownership_type = {
        equals: ownershipTypeParam.toLowerCase() as any,
      };
    }
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone_number: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }
    const [owners, totalData] = await Promise.all([
      prisma.owner.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.owner.count({ where: whereClause }),
    ]);

    const totalPage = Math.max(1, Math.ceil(totalData / limit));
    const pagination: PaginationMeta = {
      per_page: owners.length,
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
    const rawData = await request.json();
    const payload = validateCreateOwnerInput(rawData);
    const phone_number = payload.phone_number;

    if (!phone_number) {
      return Response.json(
        {
          statusCode: 400,
          message: "Nomor telepon wajib diisi",
        },
        { status: 400 },
      );
    }

    // Check if phone_number already exists
    const existingAccount = await prisma.owner.findUnique({
      where: { phone_number: phone_number },
    });

    if (existingAccount) {
      return Response.json(
        {
          statusCode: 409,
          message: "Nomor telepon sudah digunakan",
        },
        { status: 409 },
      );
    }

    if(payload.type_ownership === "special" && (payload.special_price === undefined || payload.special_price === null)) {
      return Response.json(
        {
          statusCode: 400,
          message: "Harga khusus wajib diisi untuk tipe kepemilikan khusus",
        },
        { status: 400 },
      );
    }

    if(payload.type_ownership !== "special" && payload.special_price !== undefined) {
      return Response.json(
        {
          statusCode: 400,
          message: "Harga khusus hanya boleh diisi untuk tipe kepemilikan khusus",
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.owner.create({
        data: {
          name: payload.nama_owner,
          phone_number: phone_number,
          ownership_type: payload.type_ownership,
          special_price : payload.special_price,
        },
      });

    

      return {
        owner,
      };
    });

    return Response.json(
      {
        statusCode: 201,
        message: "Customer berhasil dibuat",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      const firstErrorMessage = validationErrors[0]?.message ?? "Validation failed";
      return Response.json(
        {
          statusCode: 400,
          message: firstErrorMessage,
          errors: validationErrors,
          data: null,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        statusCode: 500,
        message: "Error creating owner",
        data: null,
      },
      { status: 500 },
    );
  }
}
