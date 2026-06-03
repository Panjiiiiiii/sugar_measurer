import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
);

type SendNotificationParams = {
    userIds: string[];
    type: string;
    title: string;
    description: string;
    url?: string;
};

export async function sendNotification({
    userIds,
    type,
    title,
    description,
    url = "/",
}: SendNotificationParams) {
    if (userIds.length === 0) return;

    // Simpan ke tabel notification (semua user sekaligus)
    await prisma.notification.createMany({
        data: userIds.map((userId) => ({
            user_id: userId,
            type,
            title,
            description,
        })),
    });

    // Ambil push subscription semua user yang perlu dinotif
    const subscriptions = await prisma.push_subscription.findMany({
        where: { user_id: { in: userIds } },
    });

    // Kirim push notification ke tiap subscription
    const pushPayload = JSON.stringify({ title, description, url });

    await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                pushPayload,
            ).catch((err) => {
                // Kalau subscription expired/invalid, hapus dari DB
                if (err.statusCode === 410) {
                    return prisma.push_subscription.delete({
                        where: { id: sub.id },
                    });
                }
            }),
        ),
    );
}