import { prisma } from "@/lib/prisma";
import { Prisma, transfer_status } from "@/generated/prisma";

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

function getTodayDateRange() {
	const now = new Date(Date.now());
	const start = new Date(now);
	const end = new Date(now);

	start.setHours(0, 0, 0, 0);
	end.setHours(23, 59, 59, 999);

	return { gte: start, lte: end };
}

function formatDateOnly(value: Date) {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(value);

	const day = parts.find((part) => part.type === "day")?.value ?? "01";
	const month = parts.find((part) => part.type === "month")?.value ?? "01";
	const year = parts.find((part) => part.type === "year")?.value ?? "1970";

	return `${year}-${month}-${day}`;
}

function formatTimeOnly(value: Date) {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Jakarta",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).format(value);
}

function getSummaryDateFilter(range: string | null) {
	if (!range) {
		return null;
	}

	const normalizedRange = range.toLowerCase();
	const now = new Date();
	const start = new Date(now);
	const end = new Date(now);

	if (normalizedRange === "daily") {
		start.setHours(0, 0, 0, 0);
		end.setHours(23, 59, 59, 999);
		return { gte: start, lte: end };
	}

	if (normalizedRange === "weekly") {
		const day = now.getDay();
		const diffToMonday = day === 0 ? 6 : day - 1;
		start.setDate(now.getDate() - diffToMonday);
		start.setHours(0, 0, 0, 0);

		end.setDate(start.getDate() + 6);
		end.setHours(23, 59, 59, 999);
		return { gte: start, lte: end };
	}

	if (normalizedRange === "monthly") {
		start.setDate(1);
		start.setHours(0, 0, 0, 0);

		end.setMonth(start.getMonth() + 1, 0);
		end.setHours(23, 59, 59, 999);
		return { gte: start, lte: end };
	}

	//

	return null;
}

function parseTransferStatus(value: string | null): transfer_status | null {
	if (!value) {
		return null;
	}

	if (value === transfer_status.in || value === transfer_status.out) {
		return value;
	}

	return null;
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
			const rawLoc = getFirstQueryParam(searchParams, ["location_id", "id_location", "location"]) || "loc-1";
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
			const mockHistory = [
				{
					tanggal: "2026-06-01",
					waktu: "14:30:22",
					bukti_tf: "/bukti-transfer.png",
					jumlah_nominal: 50000000,
					location: mockCityName,
					transfer_status: "in",
					transaction_id: "tx-mock-1"
				},
				{
					tanggal: "2026-06-02",
					waktu: "09:15:00",
					bukti_tf: null,
					jumlah_nominal: 12500000,
					location: mockCityName,
					transfer_status: "out",
					transaction_id: "tx-mock-2"
				}
			];
			return Response.json({
				statusCode: 200,
				data: {
					transaction_in: 50000000,
					transaction_out: 12500000,
					count_out_transaction: 1,
					account_balance: rawLoc === "blitar" || rawLoc === "loc-2" ? 300000000 : 500000000,
					transfer_history: mockHistory,
					page: {
						number_page: 1,
						total_page: 1,
						total_data: 2
					}
				}
			});
		}

		const pageParam = getFirstQueryParam(searchParams, ["page", "number_page", "halaman"]);
		const limitParam = getFirstQueryParam(searchParams, ["limit", "per_page", "page_size"]);
		const locationId = getFirstQueryParam(searchParams, ["location_id", "id_location", "location"]);
		const status = getFirstQueryParam(searchParams, ["status", "transfer_status"]);
		const parsedStatus = parseTransferStatus(status);
		const range = getFirstQueryParam(searchParams, ["range", "tanggal_range"]);
		const normalizedRange = range?.toLowerCase() ?? null;

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

		if (normalizedRange && !["daily", "weekly", "monthly"].includes(normalizedRange)) {
			return Response.json(
				{
					statusCode: 400,
					message: "range must be one of: daily, weekly, monthly",
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

		const whereClause: Prisma.logTransferWhereInput = {
			...(locationId ? { location_id: locationId } : {}),
			...(parsedStatus ? { transfer_status: parsedStatus } : {}),
			...(Object.keys(dateFilter).length > 0
				? {
					created_at: dateFilter,
				}
				: {}),
		};

		const summaryDateFilter = getSummaryDateFilter(normalizedRange);
		const summaryWhereBase: Prisma.logTransferWhereInput = {
			...(locationId ? { location_id: locationId } : {}),
			...(summaryDateFilter
				? {
					created_at: summaryDateFilter,
				}
				: {}),
		};

		const [transferHistory, totalData, transactionInAggregate, transactionOutAggregate, countOutTransaction] = await Promise.all([
			prisma.logTransfer.findMany({
				where: whereClause,
				skip,
				take: limit,
				orderBy: {
					created_at: "desc",
				},
				select: {
					created_at: true,
					bukti_transfer: true,
					transfer_amount: true,
					transfer_status: true,
					transaction_id: true,
					location: {
						select: {
							name: true,
							account_balance: true,
						},
					},
				},
			}),
			prisma.logTransfer.count({
				where: whereClause,
			}),
			prisma.logTransfer.aggregate({
				where: {
					...summaryWhereBase,
					transfer_status: transfer_status.in,
				},
				_sum: {
					transfer_amount: true,
				},
			}),
			prisma.logTransfer.aggregate({
				where: {
					...summaryWhereBase,
					transfer_status: transfer_status.out,
				},
				_sum: {
					transfer_amount: true,
				},
			}),
			prisma.logTransfer.count({
				where: {
					...summaryWhereBase,
					transfer_status: transfer_status.out,
				},
			}),
		]);

		const transactionIn = Number(transactionInAggregate._sum.transfer_amount ?? 0);
		const transactionOut = Number(transactionOutAggregate._sum.transfer_amount ?? 0);

		const data = transferHistory.map((transfer) => ({
			tanggal: formatDateOnly(transfer.created_at),
			waktu: formatTimeOnly(transfer.created_at),
			bukti_tf: transfer.bukti_transfer,
			jumlah_nominal: transfer.transfer_amount,
			location: transfer.location?.name,
			transfer_status: transfer.transfer_status,
			transaction_id : transfer.transaction_id,
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
				data: {
					transaction_in : transactionIn,
					transaction_out : transactionOut,
					count_out_transaction : countOutTransaction,
					account_balance : transferHistory[0]?.location?.account_balance || 0,
					transfer_history: data,
					page: pagination,
				},
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

