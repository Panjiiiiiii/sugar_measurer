import { prisma } from "@/lib/prisma";

function formatTimeOnly(value: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(value);
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

function formatDisplayDate(value: Date) {
    return new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(value);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const transfer = await prisma.transaction.findUnique({
            where: {
                id,
            },
            include: {
                truck: {
                    select : {
                        id: true,
                        license_plate: true,
                        name: true,
                    }
                },
                owner : {
                    select : {
                        id: true,
                        name: true,
                        ownership_type: true,
                    }
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        sugar_price: true,
                    },
                },
            }
        });
        if (!transfer) {
            return Response.json(
                {
                    statusCode: 404,
                    message: "Transfer tidak ditemukan",
                    data: null,
                },
                { status: 404 },
            );
        }
        const data = {
            id: transfer.id,
            transaction_date: formatDisplayDate(transfer.transaction_date),
            loading_in: formatTimeOnly(transfer.loading_in),
            loading_out: transfer.loading_out ? formatTimeOnly(transfer.loading_out) : null,
            bruto: transfer.bruto_weight,
            tare: transfer.tarra_weight,
            netto: transfer.netto_weight,
            current_price: transfer.current_price,
            total_price: transfer.total_price,
            payment_method: transfer.payment_method,
            status: transfer.status,
            driver_name: transfer.driver_name,
            truck_id: transfer.truck_id,
            truck_name: transfer.truck.name,
            license_plate: transfer.truck.license_plate,
            owner_id: transfer.owner_id,
            owner_name: transfer.owner?.name ?? null,
            ownership_type: transfer.owner?.ownership_type ?? null,
            location_id: transfer.location_id,
            location_name: transfer.location.name,
            sugar_price: transfer.location.sugar_price,
        };

        return Response.json(
            {
                statusCode: 200,
                data,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching transfer:", error);
        return Response.json(
            {
                statusCode: 500,
                message: "Terjadi kesalahan saat mengambil data transfer",
                data: null,
            },
            { status: 500 },
        );
    }
}
