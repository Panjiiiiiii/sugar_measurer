import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { id } from "zod/locales";

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
	return value.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		const pageParam = getFirstQueryParam(searchParams, ["page", "number_page", "halaman"]);
		const limitParam = getFirstQueryParam(searchParams, ["limit", "per_page", "page_size"]);
		const locationId = getFirstQueryParam(searchParams, ["location_id", "id_location"]);

		const startDateRaw = getFirstQueryParam(searchParams, ["start_date", "tanggal_mulai"]);
		const endDateRaw = getFirstQueryParam(searchParams, ["end_date", "tanggal_akhir"]);

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

		const whereClause: Prisma.transactionWhereInput = {
			...(locationId ? { location_id: locationId } : {}),
			...(Object.keys(dateFilter).length > 0
				? {
						transaction_date: dateFilter,
					}
				: {}),
		};

		// compute KPI counts for statuses: paid, unpaid and inqueue (DB uses 'queue')
		const [paidCount, unpaidCount, inqueueCount] = await Promise.all([
			prisma.transaction.count({ where: { ...whereClause, status: "paid" } }),
			prisma.transaction.count({ where: { ...whereClause, status: "unpaid" } }),
			prisma.transaction.count({ where: { ...whereClause, status: "queue" } }),
		]);

		const kpi = {
			paid: paidCount,
			unpaid: unpaidCount,
			inqueue: inqueueCount,
		};

		const [transactions, totalData] = await Promise.all([
			prisma.transaction.findMany({
				where: whereClause,
				skip,
				take: limit,
				orderBy: {
					transaction_date: "desc",
				},
				select: {
					id: true,
					transaction_date: true,
					netto_weight: true,
					bruto_weight: true,
					tarra_weight: true,
					total_price: true,
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
					location : {
						select : {
							id : true,
							name : true
						}
					},
					user : {
						select : {
							id : true,
							name : true
						}
					}
				},
			}),
			prisma.transaction.count({
				where: whereClause,
			}),
		]);
		const inQueue = transactions
			.filter((transaction) => transaction.status === "queue")
			.map((transaction) => ({
				id: transaction.id,
				tanggal_transaksi: formatDateOnly(transaction.transaction_date),
				no_pol_truck: transaction.truck.license_plate,
				nama_petani: transaction.owner?.name ?? "",
				nama_driver: transaction.driver_name,
				price : transaction.current_price,
				location : transaction.location.name,
				operator : transaction.user?.name,
				type_ownership: transaction.owner?.ownership_type,
				bruto : transaction.bruto_weight ?? 0,
				tara : transaction.tarra_weight ?? 0,
				netto: transaction.netto_weight ?? 0,
				amount: transaction.total_price ?? 0,
				status: transaction.status,
			}));

		const history = transactions
			.filter((transaction) => transaction.status !== "queue")
			.map((transaction) => ({
				id: transaction.id,
				tanggal_transaksi: formatDateOnly(transaction.transaction_date),
				no_pol_truck: transaction.truck.license_plate,
				nama_petani: transaction.owner?.name ?? "",
				nama_driver: transaction.driver_name,
				price : transaction.current_price,
				location : transaction.location.name,
				operator : transaction.user?.name,
				type_ownership: transaction.owner?.ownership_type,
				bruto : transaction.bruto_weight ?? 0,
				tara : transaction.tarra_weight ?? 0,
				netto: transaction.netto_weight ?? 0,
				amount: transaction.total_price ?? 0,
				status: transaction.status,
			}));

		const totalPage = Math.max(1, Math.ceil(totalData / limit));
		const pagination: PaginationMeta = {
			number_page: page,
			total_page: totalPage,
			total_data: totalData,
		};

		return Response.json(
			{
				statusCode: 200,
				kpi,
				data : {
					paid: kpi.paid,
					unpaid: kpi.unpaid,
					inqueue: kpi.inqueue,
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

