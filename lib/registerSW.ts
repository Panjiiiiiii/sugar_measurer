export async function registerServiceWorker(userId: string) {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push notification tidak didukung browser ini");
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Izin notifikasi ditolak");
            return;
        }

        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            // Sudah subscribe sebelumnya, skip
            return;
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        });

        const { endpoint, keys } = subscription.toJSON();

        await fetch("/api/notification/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                endpoint,
                p256dh: keys?.p256dh,
                auth: keys?.auth,
            }),
        });

    } catch (error) {
        console.error("Gagal register service worker:", error);
    }
}