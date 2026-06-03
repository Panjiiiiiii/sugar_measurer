import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { validateCreateLocationInput } from "@/schema/location";
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
  const { searchParams } = new URL(request.url);
  const pageParam = getFirstQueryParam(searchParams, [
    "page",
    "number_page",
    "halaman",
  ]);
  const limitParam = getFirstQueryParam(searchParams, [
    "limit",
    "per_page",
    "page_size",
  ]);
  const page = parsePositiveInt(pageParam, 1);
  const limit = parsePositiveInt(limitParam, 10);
  const skip = (page - 1) * limit;

  const [locations, totalData] = await Promise.all([
    prisma.location.findMany({
      skip,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
    }),
    prisma.location.count(),
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
      data: locations,
      page: pagination,
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    const locationData = validateCreateLocationInput(rawData);

    const location = await prisma.location.create({
      data: locationData,
    });
    return Response.json(
      {
        statusCode: 201,
        message: "Lokasi berhasil dibuat",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      const firstErrorMessage =
        validationErrors[0]?.message ?? "Validation failed";
      return Response.json(
        {
          statusCode: 400,
          message: firstErrorMessage,
          errors: validationErrors,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        statusCode: 500,
        message: "Error creating location",
        data: null,
      },
      { status: 500 },
    );
  }
}
