import { prisma } from "@/lib/prisma";
import { createdAtFilter, parseLogDateRange } from "@/lib/sugar-price-log";

interface ChartPoint {
  date: string;
  price: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");

    const range = parseLogDateRange(searchParams);
    if (range.error !== undefined) {
      return Response.json(
        { statusCode: 400, message: range.error },
        { status: 400 },
      );
    }

    const locations = await prisma.location.findMany({
      where: locationId ? { id: locationId } : undefined,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    const locationIds = locations.map((l) => l.id);
    const createdAt = createdAtFilter(range);

    const [rows, priorRows] = await Promise.all([
      prisma.sugar_price_log.findMany({
        where: {
          location_id: { in: locationIds },
          ...(createdAt ? { created_at: createdAt } : {}),
        },
        orderBy: [{ created_at: "asc" }, { id: "asc" }],
        select: { location_id: true, created_at: true, new_price: true },
      }),
      // With a start date, find the price already in effect at `start` so the
      // step line begins at the left edge, not at the first change inside the range.
      range.start
        ? Promise.all(
            locationIds.map((id) =>
              prisma.sugar_price_log.findFirst({
                where: { location_id: id, created_at: { lt: range.start } },
                orderBy: [{ created_at: "desc" }, { id: "desc" }],
                select: { location_id: true, new_price: true },
              }),
            ),
          )
        : Promise.resolve([]),
    ]);

    // Final point: "now", capped at `end` when the range ends in the past.
    const now = new Date();
    const rangeEnd = range.end
      ? new Date(range.end.getTime() - (range.endExclusive ? 1 : 0))
      : undefined;
    const tail = rangeEnd && rangeEnd < now ? rangeEnd : now;

    const data = locations.map((location) => {
      const points: ChartPoint[] = [];

      const prior = priorRows.find((p) => p?.location_id === location.id);
      if (prior && range.start) {
        points.push({ date: range.start.toISOString(), price: prior.new_price });
      }

      for (const row of rows) {
        if (row.location_id === location.id) {
          points.push({ date: row.created_at.toISOString(), price: row.new_price });
        }
      }

      if (points.length > 0) {
        points.push({ date: tail.toISOString(), price: points[points.length - 1].price });
      }

      return { location_id: location.id, location_name: location.name, points };
    });

    return Response.json({ statusCode: 200, data }, { status: 200 });
  } catch (error) {
    return Response.json(
      { statusCode: 500, message: "Internal server error" },
      { status: 500 },
    );
  }
}
