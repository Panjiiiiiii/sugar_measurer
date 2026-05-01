import { prisma } from "@/lib/prisma";
import { validateCreateOwnerInput } from "@/schema/owner";
import { z } from "zod";

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
    const rawData = await request.json();
    const payload = validateCreateOwnerInput(rawData);
    const accountNumber = payload.account_number;

    if (!accountNumber) {
      return Response.json(
        {
          statusCode: 400,
          message: "Account number is required",
        },
        { status: 400 },
      );
    }

    // Check if account_number already exists
    const existingAccount = await prisma.owner.findUnique({
      where: { account_number: accountNumber },
    });

    if (existingAccount) {
      return Response.json(
        {
          statusCode: 409,
          message: "Account number already exists",
        },
        { status: 409 },
      );
    }

    if(payload.type_ownership === "special" && (payload.special_price === undefined || payload.special_price === null)) {
      return Response.json(
        {
          statusCode: 400,
          message: "Special price is required for special ownership type",
        },
        { status: 400 },
      );
    }

    if(payload.type_ownership !== "special" && payload.special_price !== undefined) {
      return Response.json(
        {
          statusCode: 400,
          message: "Special price should only be provided for special ownership type",
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.owner.create({
        data: {
          name: payload.nama_owner,
          account_number: accountNumber,
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
        message: "Owner created successfully",
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
