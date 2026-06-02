import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { id } from "zod/locales";

interface PaginationMeta {
  number_page: number;
  total_page: number;
  total_data: number;
  per_page: number;
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

function parseDateParam(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function formatDateOnly(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatTimeOnly(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
      const rawLoc = getFirstQueryParam(searchParams, ["location_id", "id_location"]) || "loc-1";
      const mockCityMap: Record<string, string> = {
        "loc-1": "Malang",
        "loc-2": "Blitar",
        "loc-3": "Kediri 1",
        "loc-4": "Kediri 2",
        "malang": "Malang",
        "blitar": "Blitar",
        "kediri-1": "Kediri 1",
        "kediri-2": "Kediri 2",
      };
      const mockCityName = mockCityMap[rawLoc] || "Malang";

      const mockInQueue = [
        {
          id: "tx-q-1",
          tanggal_transaksi: "2026-06-02",
          loading_in: "08:15",
          no_pol_truck: "N 1234 AB",
          nama_petani: "Joko",
          nama_driver: "Slamet",
          price: 14500,
          location: mockCityName,
          operator: "Dadang",
          type_ownership: "farmer",
          bruto: 8500,
          tara: 0,
          netto: 0,
          amount: 0,
          payment_method: "cash",
          status: "queue",
        }
      ];

      const mockHistory = [
        {
          id: "tx-h-1",
          tanggal_transaksi: "2026-06-01",
          loading_in: "10:00",
          loading_out: "10:30",
          no_pol_truck: "AG 9876 CD",
          nama_petani: "Budi",
          nama_driver: "Eko",
          price: 14500,
          location: mockCityName,
          operator: "Dadang",
          type_ownership: "farmer",
          bruto: 9500,
          tara: 1500,
          netto: 8000,
          amount: 116000000,
          payment_method: "transfer",
          status: "paid",
        },
        {
          id: "tx-h-2",
          tanggal_transaksi: "2026-06-01",
          loading_in: "11:15",
          loading_out: "11:45",
          no_pol_truck: "L 5678 EF",
          nama_petani: "Hadi",
          nama_driver: "Ari",
          price: 14500,
          location: mockCityName,
          operator: "Dadang",
          type_ownership: "private",
          bruto: 10200,
          tara: 1700,
          netto: 8500,
          amount: 123250000,
          payment_method: "cash",
          status: "unpaid",
        }
      ];

      return Response.json({
        statusCode: 200,
        kpi: {
          paid: 116000000,
          unpaid: 123250000,
          inqueue: 1
        },
        data: {
          inQueue: mockInQueue,
          history: mockHistory,
        },
        page: {
          number_page: 1,
          total_page: 1,
          total_data: 2,
          per_page: 10
        }
      });
    }

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
    const locationId = getFirstQueryParam(searchParams, [
      "location_id",
      "id_location",
    ]);

    const startDateRaw = getFirstQueryParam(searchParams, [
      "start_date",
      "tanggal_mulai",
    ]);
    const endDateRaw = getFirstQueryParam(searchParams, [
      "end_date",
      "tanggal_akhir",
    ]);

    const ownershipType = getFirstQueryParam(searchParams, [
      "ownership_type",
      "type_ownership",
    ]);
    const statusFilter = getFirstQueryParam(searchParams, ["status"]);
    const customerFilter = getFirstQueryParam(searchParams, ["customer"]);

    const page = parsePositiveInt(pageParam, 1);
    const limit = parsePositiveInt(limitParam, 10);
    const skip = (page - 1) * limit;

    const parsedStartDate = parseDateParam(startDateRaw);
    const parsedEndDate = parseDateParam(endDateRaw);

    if (startDateRaw && !parsedStartDate) {
      return Response.json(
        {
          statusCode: 400,
          message: "start_date must be a valid date",
          data: null,
        },
        { status: 400 },
      );
    }

    if (endDateRaw && !parsedEndDate) {
      return Response.json(
        {
          statusCode: 400,
          message: "end_date must be a valid date",
          data: null,
        },
        { status: 400 },
      );
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return Response.json(
        {
          statusCode: 400,
          message: "start_date must be less than or equal to end_date",
          data: null,
        },
        { status: 400 },
      );
    }

    const dateFilter: Prisma.DateTimeFilter = {};

    if (parsedStartDate) {
      parsedStartDate.setHours(0, 0, 0, 0);
      dateFilter.gte = parsedStartDate;
    }

    if (parsedEndDate) {
      parsedEndDate.setHours(23, 59, 59, 999);
      dateFilter.lte = parsedEndDate;
    }

    const baseWhereClause: Prisma.transactionWhereInput = {
      ...(locationId ? { location_id: locationId } : {}),
    };

    const filterWhereClause: Prisma.transactionWhereInput = {
      ...baseWhereClause,
      ...(Object.keys(dateFilter).length > 0
        ? { transaction_date: dateFilter }
        : {}),
      ...(ownershipType || customerFilter
        ? {
            owner: {
              ...(ownershipType
                ? { ownership_type: ownershipType as any }
                : {}),
              ...(customerFilter
                ? { name: { contains: customerFilter, mode: "insensitive" } }
                : {}),
            },
          }
        : {}),
    };

    // compute KPI values for paid/unpaid and count the in-queue items
    const [paidSummary, unpaidSummary, inqueueCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...baseWhereClause, status: "paid" },
        _sum: {
          total_price: true,
        },
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhereClause, status: "unpaid" },
        _sum: {
          total_price: true,
        },
      }),
      prisma.transaction.count({
        where: { ...baseWhereClause, status: "queue" },
      }),
    ]);

    const kpi = {
      paid: Number(paidSummary._sum.total_price ?? 0),
      unpaid: Number(unpaidSummary._sum.total_price ?? 0),
      inqueue: inqueueCount,
    };

    const historyWhereClause: Prisma.transactionWhereInput = {
      ...filterWhereClause,
      status:
        statusFilter && (statusFilter === "paid" || statusFilter === "unpaid")
          ? statusFilter
          : { not: "queue" },
    };

    const [transactions, totalData] = await Promise.all([
      prisma.transaction.findMany({
        where: historyWhereClause,
        skip,
        take: limit,
        orderBy: {
          transaction_date: "desc",
        },
        select: {
          id: true,
          transaction_date: true,
          loading_in: true,
          loading_out: true,
          netto_weight: true,
          bruto_weight: true,
          tarra_weight: true,
          total_price: true,
          payment_method: true,
          status: true,
          driver_name: true,
          current_price: true,
          truck: {
            select: {
              license_plate: true,
            },
          },
          owner: {
            select: {
              name: true,
              ownership_type: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.transaction.count({
        where: historyWhereClause,
      }),
    ]);

    const inQueueTransactions = await prisma.transaction.findMany({
      where: { ...baseWhereClause, status: "queue" },
      orderBy: { transaction_date: "desc" },
      select: {
        id: true,
        transaction_date: true,
        loading_in: true,
        loading_out: true,
        netto_weight: true,
        bruto_weight: true,
        tarra_weight: true,
        total_price: true,
        payment_method: true,
        status: true,
        driver_name: true,
        current_price: true,
        truck: { select: { license_plate: true } },
        owner: { select: { name: true, ownership_type: true } },
        location: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });

    const inQueue = inQueueTransactions.map((transaction) => ({
      id: transaction.id,
      tanggal_transaksi: formatDateOnly(transaction.transaction_date),
      loading_in: formatTimeOnly(transaction.loading_in),
      no_pol_truck: transaction.truck.license_plate,
      nama_petani: transaction.owner?.name ?? "",
      nama_driver: transaction.driver_name,
      price: transaction.current_price,
      location: transaction.location.name,
      operator: transaction.user?.name,
      type_ownership: transaction.owner?.ownership_type,
      bruto: transaction.bruto_weight ?? 0,
      tara: transaction.tarra_weight ?? 0,
      netto: transaction.netto_weight ?? 0,
      amount: transaction.total_price ?? 0,
      payment_method: transaction.payment_method,
      status: transaction.status,
    }));

    const history = transactions.map((transaction) => ({
      id: transaction.id,
      tanggal_transaksi: formatDateOnly(transaction.transaction_date),
      loading_in: formatTimeOnly(transaction.loading_in),
      loading_out: transaction.loading_out
        ? formatTimeOnly(transaction.loading_out)
        : "",
      no_pol_truck: transaction.truck.license_plate,
      nama_petani: transaction.owner?.name ?? "",
      nama_driver: transaction.driver_name,
      price: transaction.current_price,
      location: transaction.location.name,
      operator: transaction.user?.name,
      type_ownership: transaction.owner?.ownership_type,
      bruto: transaction.bruto_weight ?? 0,
      tara: transaction.tarra_weight ?? 0,
      netto: transaction.netto_weight ?? 0,
      amount: transaction.total_price ?? 0,
      payment_method: transaction.payment_method,
      status: transaction.status,
    }));

    const totalPage = Math.max(1, Math.ceil(totalData / limit));
    const pagination: PaginationMeta = {
      number_page: page,
      total_page: totalPage,
      total_data: totalData,
      per_page: limit,
    };

    return Response.json(
      {
        statusCode: 200,
        kpi,
        data: {
          inQueue,
          history,
        },
        page: pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        statusCode: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}
