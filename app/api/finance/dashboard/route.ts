import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type FilterType = "today" | "week" | "month" | "year" | "all";

interface ChartPoint {
  label: string;
  tonase: number;
}

function getFirstQueryParam(searchParams: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) return value;
  }
  return null;
}

function getDateRange(filter: FilterType): { start: Date; end: Date } | null {
  if (filter === "all") return null;

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (filter) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "week": {
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      start.setDate(now.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

function toJakartaDate(date: Date) {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
}

function buildChartData(
  transactions: { netto_weight: number | null; loading_in: Date }[],
  filter: FilterType,
  dateRange: { start: Date; end: Date } | null
): ChartPoint[] {
  switch (filter) {
    case "today": {
      const buckets: Record<number, number> = {};
      for (let h = 0; h < 24; h++) buckets[h] = 0;
      for (const tx of transactions) {
        const wib = toJakartaDate(tx.loading_in);
        const hour = wib.getUTCHours();
        buckets[hour] = (buckets[hour] ?? 0) + (tx.netto_weight ?? 0);
      }
      return Object.entries(buckets).map(([hour, tonase]) => ({
        label: `${String(hour).padStart(2, "0")}:00`,
        tonase,
      }));
    }

    case "week": {
      const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const buckets: Record<number, number> = {};
      for (let d = 0; d < 7; d++) buckets[d] = 0;
      for (const tx of transactions) {
        const wib = toJakartaDate(tx.loading_in);
        const dayIndex = (wib.getUTCDay() + 6) % 7;
        buckets[dayIndex] = (buckets[dayIndex] ?? 0) + (tx.netto_weight ?? 0);
      }
      return Object.entries(buckets).map(([idx, tonase]) => ({
        label: DAY_NAMES[Number(idx)],
        tonase,
      }));
    }

    case "month": {
      const refDate = dateRange?.start ?? new Date();
      const daysInMonth = new Date(
        refDate.getFullYear(),
        refDate.getMonth() + 1,
        0
      ).getDate();
      const buckets: Record<number, number> = {};
      for (let d = 1; d <= daysInMonth; d++) buckets[d] = 0;
      for (const tx of transactions) {
        const wib = toJakartaDate(tx.loading_in);
        const date = wib.getUTCDate();
        buckets[date] = (buckets[date] ?? 0) + (tx.netto_weight ?? 0);
      }
      return Object.entries(buckets).map(([date, tonase]) => ({
        label: String(date),
        tonase,
      }));
    }

    case "year": {
      const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const buckets: Record<number, number> = {};
      for (let m = 0; m < 12; m++) buckets[m] = 0;
      for (const tx of transactions) {
        const wib = toJakartaDate(tx.loading_in);
        const month = wib.getUTCMonth();
        buckets[month] = (buckets[month] ?? 0) + (tx.netto_weight ?? 0);
      }
      return Object.entries(buckets).map(([month, tonase]) => ({
        label: MONTH_NAMES[Number(month)],
        tonase,
      }));
    }

    case "all": {
      const buckets: Record<number, number> = {};
      for (const tx of transactions) {
        const wib = toJakartaDate(tx.loading_in);
        const year = wib.getUTCFullYear();
        buckets[year] = (buckets[year] ?? 0) + (tx.netto_weight ?? 0);
      }
      return Object.entries(buckets)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, tonase]) => ({ label: year, tonase }));
    }
  }
}

export async function GET(request: Request) {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
    const { searchParams } = new URL(request.url);
    const filterRaw = getFirstQueryParam(searchParams, ["filter", "range"]) || "today";
    const chartLocationId = getFirstQueryParam(searchParams, ["location_id", "id_location"]);

    let chartData: ChartPoint[] = [];
    if (filterRaw === "today") {
      for (let h = 0; h < 24; h += 2) {
        chartData.push({ label: `${String(h).padStart(2, "0")}:00`, tonase: Math.floor(Math.random() * 200000) + 50000 });
      }
    } else if (filterRaw === "week") {
      const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      chartData = DAY_NAMES.map((name) => ({ label: name, tonase: Math.floor(Math.random() * 1500000) + 400000 }));
    } else {
      const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      chartData = MONTH_NAMES.map((name) => ({ label: name, tonase: Math.floor(Math.random() * 5000000) + 1500000 }));
    }

    const mockLocations = [
      { id: "loc-1", name: "Malang", sugar_price: 14500, account_balance: 500000000, paid_tonase: 250000, queue_tonase: 120000, transaction_in: 750000000, transaction_out: 250000000 },
      { id: "loc-2", name: "Blitar", sugar_price: 14200, account_balance: 300000000, paid_tonase: 180000, queue_tonase: 90000, transaction_in: 500000000, transaction_out: 200000000 },
      { id: "loc-3", name: "Kediri 1", sugar_price: 14300, account_balance: 250000000, paid_tonase: 150000, queue_tonase: 60000, transaction_in: 400000000, transaction_out: 150000000 },
      { id: "loc-4", name: "Kediri 2", sugar_price: 14300, account_balance: 200000000, paid_tonase: 120000, queue_tonase: 50000, transaction_in: 300000000, transaction_out: 100000000 },
    ];

    const totalKas = mockLocations.reduce((sum, loc) => sum + loc.account_balance, 0);
    const totalTonase = mockLocations.reduce((sum, loc) => sum + loc.paid_tonase + loc.queue_tonase, 0);
    const totalKeluar = mockLocations.reduce((sum, loc) => sum + loc.transaction_out, 0);

    return Response.json({
      statusCode: 200,
      data: {
        filter: filterRaw,
        kpi: {
          total_kas: totalKas,
          total_tonase: totalTonase,
          total_transaksi_keluar: totalKeluar,
        },
        chart: {
          location_id: chartLocationId ?? null,
          data: chartData,
        },
        locations: mockLocations,
      },
    });
  }

  try {
    const { searchParams } = new URL(request.url);

    const filterRaw = getFirstQueryParam(searchParams, ["filter", "range"]);
    const chartLocationId = getFirstQueryParam(searchParams, ["location_id", "id_location"]);

    const VALID_FILTERS: FilterType[] = ["today", "week", "month", "year", "all"];
    const filter: FilterType = VALID_FILTERS.includes(filterRaw as FilterType)
      ? (filterRaw as FilterType)
      : "today";

    const dateRange = getDateRange(filter);

    const transactionDateFilter: Prisma.DateTimeFilter | undefined = dateRange
      ? { gte: dateRange.start, lte: dateRange.end }
      : undefined;

    const transferDateFilter: Prisma.DateTimeFilter | undefined = dateRange
      ? { gte: dateRange.start, lte: dateRange.end }
      : undefined;

    const chartWhereClause: Prisma.transactionWhereInput = {
      ...(chartLocationId ? { location_id: chartLocationId } : {}),
      ...(transactionDateFilter ? { loading_in: transactionDateFilter } : {}),
    };

    // Ambil semua lokasi dulu untuk di-loop aggregate
    const locations = await prisma.location.findMany({
      orderBy: { created_at: "asc" },
      select: {
        id: true,
        name: true,
        sugar_price: true,
        account_balance: true,
      },
    });

    // Semua query global jalan paralel
    const [
      totalKasResult,
      totalTonaseResult,
      totalKeluarResult,
      chartTransactions,
    ] = await Promise.all([
      prisma.location.aggregate({
        _sum: { account_balance: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...(transactionDateFilter ? { transaction_date: transactionDateFilter } : {}),
        },
        _sum: { netto_weight: true },
      }),
      prisma.logTransfer.aggregate({
        where: {
          transfer_status: "out",
          ...(transferDateFilter ? { created_at: transferDateFilter } : {}),
        },
        _sum: { transfer_amount: true },
      }),
      prisma.transaction.findMany({
        where: chartWhereClause,
        select: { netto_weight: true, loading_in: true },
        orderBy: { loading_in: "asc" },
      }),
    ]);

    // Per-lokasi aggregate — paralel semua lokasi sekaligus
    const locationCards = await Promise.all(
      locations.map(async (loc) => {
        const txWhere: Prisma.transactionWhereInput = {
          location_id: loc.id,
          ...(transactionDateFilter ? { transaction_date: transactionDateFilter } : {}),
        };
        const tfWhere: Prisma.logTransferWhereInput = {
          location_id: loc.id,
          ...(transferDateFilter ? { created_at: transferDateFilter } : {}),
        };

        const [paidTonase, queueTonase, txIn, txOut] = await Promise.all([
          prisma.transaction.aggregate({
            where: { ...txWhere, status: "paid" },
            _sum: { netto_weight: true },
          }),
          prisma.transaction.aggregate({
            where: { ...txWhere, status: "queue" },
            _sum: { netto_weight: true },
          }),
          prisma.logTransfer.aggregate({
            where: { ...tfWhere, transfer_status: "in" },
            _sum: { transfer_amount: true },
          }),
          prisma.logTransfer.aggregate({
            where: { ...tfWhere, transfer_status: "out" },
            _sum: { transfer_amount: true },
          }),
        ]);

        return {
          id: loc.id,
          name: loc.name,
          sugar_price: loc.sugar_price,
          account_balance: loc.account_balance ?? 0,
          paid_tonase: Number(paidTonase._sum.netto_weight ?? 0),
          queue_tonase: Number(queueTonase._sum.netto_weight ?? 0),
          transaction_in: Number(txIn._sum.transfer_amount ?? 0),
          transaction_out: Number(txOut._sum.transfer_amount ?? 0),
        };
      })
    );

    const chart = buildChartData(chartTransactions, filter, dateRange);

    return Response.json(
      {
        statusCode: 200,
        data: {
          filter,
          kpi: {
            total_kas: Number(totalKasResult._sum.account_balance ?? 0),
            total_tonase: Number(totalTonaseResult._sum.netto_weight ?? 0),
            total_transaksi_keluar: Number(totalKeluarResult._sum.transfer_amount ?? 0),
          },
          chart: {
            location_id: chartLocationId ?? null,
            data: chart,
          },
          locations: locationCards,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        statusCode: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}