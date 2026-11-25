import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { Prisma } from "@/generated/prisma";

type Db = Prisma.TransactionClient;

/**
 * Insert a sugar_price_log row, but only when the price actually changed.
 * Pass oldPrice = null for a location's initial price.
 * Returns true when a row was written.
 */
export async function logSugarPriceChange(
  tx: Db,
  {
    locationId,
    oldPrice,
    newPrice,
    userId,
  }: {
    locationId: string;
    oldPrice: number | null;
    newPrice: number;
    userId: string | null;
  },
): Promise<boolean> {
  if (oldPrice === newPrice) return false;

  await tx.sugar_price_log.create({
    data: {
      location_id: locationId,
      old_price: oldPrice,
      new_price: newPrice,
      changed_by: userId,
    },
  });
  return true;
}

/**
 * Current user id from the JWT "token" cookie, verified the same way
 * middleware.ts does it (jose + JWT_SECRET, user id in `sub`).
 *
 * This verifies the cookie itself on purpose and does not trust the
 * x-user-id header. Middleware skips /api/location (it is in PUBLIC_PATHS),
 * so on those routes that header is never set by us and a client could
 * send its own.
 *
 * Returns null when there is no token or it is invalid/expired.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse optional `start` / `end` ISO query params for the sugar-log endpoints.
 * A date-only `end` (e.g. "2026-11-25") includes that whole day.
 * Returns { error } when a value is not a valid date.
 */
export function parseLogDateRange(searchParams: URLSearchParams):
  | { start?: Date; end?: Date; endExclusive: boolean; error?: undefined }
  | { error: string } {
  const startRaw = searchParams.get("start");
  const endRaw = searchParams.get("end");

  let start: Date | undefined;
  let end: Date | undefined;
  let endExclusive = false;

  if (startRaw) {
    start = new Date(startRaw);
    if (Number.isNaN(start.getTime())) return { error: "Invalid start date" };
  }
  if (endRaw) {
    end = new Date(endRaw);
    if (Number.isNaN(end.getTime())) return { error: "Invalid end date" };
    if (DATE_ONLY.test(endRaw)) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      endExclusive = true;
    }
  }

  return { start, end, endExclusive };
}

export function createdAtFilter(range: {
  start?: Date;
  end?: Date;
  endExclusive: boolean;
}): Prisma.DateTimeFilter | undefined {
  if (!range.start && !range.end) return undefined;
  return {
    ...(range.start ? { gte: range.start } : {}),
    ...(range.end ? (range.endExclusive ? { lt: range.end } : { lte: range.end }) : {}),
  };
}
