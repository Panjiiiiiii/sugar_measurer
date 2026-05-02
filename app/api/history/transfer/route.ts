import { prisma } from "@/lib/prisma";
import { Prisma, transfer_status } from "@/generated/prisma/client";

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
		const locationId = getFirstQueryParam(searchParams, ["location_id", "id_location", "location"]);

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

		const whereClause: Prisma.logTransferWhereInput = {
			...(locationId ? { location_id: locationId } : {}),
			...(Object.keys(dateFilter).length > 0
				? {
					created_at: dateFilter,
				}
				: {}),
		};

		const [transferHistory, totalData] = await Promise.all([
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
					location: {
						select: {
							name: true,
						},
					},
				},
			}),
			prisma.logTransfer.count({
				where: whereClause,
			}),
		]);

		const data = transferHistory.map((transfer) => ({
			tanggal: formatDateOnly(transfer.created_at),
			bukti_tf: transfer.bukti_transfer,
			jumlah_nominal: transfer.transfer_amount,
			location: transfer.location?.name,
			transfer_status: transfer.transfer_status
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

