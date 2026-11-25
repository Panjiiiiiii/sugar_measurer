import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { createdAtFilter, parseLogDateRange } from "@/lib/sugar-price-log";

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);

    const range = parseLogDateRange(searchParams);
    if (range.error !== undefined) {
      return Response.json(
        { statusCode: 400, message: range.error },
        { status: 400 },
      );
    }

    const where: Prisma.sugar_price_logWhereInput = {
      ...(locationId ? { location_id: locationId } : {}),
      ...(createdAtFilter(range) ? { created_at: createdAtFilter(range) } : {}),
    };

    const [rows, totalData] = await Promise.all([
      prisma.sugar_price_log.findMany({
        where,
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          location: { select: { name: true } },
          user: { select: { name: true, role: true } },
        },
      }),
      prisma.sugar_price_log.count({ where }),
    ]);

    return Response.json(
      {
        statusCode: 200,
        data: rows.map((row) => ({
          id: row.id,
          created_at: row.created_at,
          location_id: row.location_id,
          location_name: row.location.name,
          old_price: row.old_price,
          new_price: row.new_price,
          changed_by_name: row.user?.name ?? null,
          changed_by_role: row.user?.role ?? null,
        })),
        page: {
          per_page: limit,
          number_page: page,
          total_page: Math.max(1, Math.ceil(totalData / limit)),
          total_data: totalData,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { statusCode: 500, message: "Internal server error" },
      { status: 500 },
    );
  }
}
