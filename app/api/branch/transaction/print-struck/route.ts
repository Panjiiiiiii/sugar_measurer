import { prisma } from "@/lib/prisma";

function formatDateTime(date: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return {
        date: `${day}-${month}-${year}`,
        time: `${hours}:${minutes}:${seconds}`,
        full: `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`,
    };
}

export async function POST(request: Request) {
    try {
        const rawBody = await request.json();
        const { transaction_id, user_id } = rawBody;

        if (!transaction_id || typeof transaction_id !== "string" || transaction_id.trim() === "") {
            return Response.json(
                {
                    statusCode: 400,
                    message: "transaction_id is required",
                    data: null,
                },
                { status: 400 },
            );
        }

        if (!user_id || typeof user_id !== "string" || user_id.trim() === "") {
            return Response.json(
                {
                    statusCode: 400,
                    message: "user_id is required",
                    data: null,
                },
                { status: 400 },
            );
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transaction_id },
            include: {
                truck: {
                    include: {
                        owner: true,
                    },
                },
                location: true,
            },
        });

        if (!transaction) {
            return Response.json(
                {
                    statusCode: 404,
                    message: "Transaction not found",
                    data: null,
                },
                { status: 404 },
            );
        }

        const operator = await prisma.user.findUnique({
            where: { id: user_id },
        });

        if (!operator) {
            return Response.json(
                {
                    statusCode: 404,
                    message: "User not found",
                    data: null,
                },
                { status: 404 },
            );
        }

        const loadingIn = formatDateTime(new Date(transaction.loading_in));
        const loadingOut = formatDateTime(new Date(transaction.loading_out));

        const harga = transaction.location.sugar_price;
        const netto = transaction.netto_weight ?? 0;
        const total = transaction.total_price ?? netto * harga;

        return Response.json(
            {
                statusCode: 200,
                message: "Success",
                data: {
                    header: {
                        nama_lokasi: transaction.location.name,
                        judul: "BUKTI PENIMBANGAN / NOTA PEMBAYARAN",
                    },
                    detail: {
                        customer: transaction.truck.owner.name,
                        material: "TEBU",
                        no_pol: transaction.truck.license_plate,
                        masuk: {
                            tanggal: loadingIn.date,
                            jam: loadingIn.time,
                            full: loadingIn.full,
                        },
                        keluar: {
                            tanggal: loadingOut.date,
                            jam: loadingOut.time,
                            full: loadingOut.full,
                        },
                    },
                    timbangan: {
                        bruto: {
                            value: transaction.bruto_weight,
                            satuan: "kg",
                        },
                        tarra: {
                            value: transaction.tarra_weight,
                            satuan: "kg",
                        },
                        netto: {
                            value: netto,
                            satuan: "kw",
                        },
                    },
                    pembayaran: {
                        harga_per_kw: harga,
                        harga_display: `Rp. ${harga.toLocaleString("id-ID")},-/kw`,
                        total: total,
                        total_display: `Rp. ${total.toLocaleString("id-ID")},-`,
                    },
                    operator: {
                        nama: operator.name,
                    },
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