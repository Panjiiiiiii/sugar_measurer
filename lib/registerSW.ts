export async function registerServiceWorker(userId: string) {
    console.log("registerServiceWorker dipanggil, userId:", userId);
    
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push notification tidak didukung browser ini");
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("SW registered:", registration);

        const permission = await Notification.requestPermission();
        console.log("Permission:", permission);
        if (permission !== "granted") {
            console.warn("Izin notifikasi ditolak");
            return;
        }

        const existingSubscription = await registration.pushManager.getSubscription();
        console.log("Existing subscription:", existingSubscription);

        if (existingSubscription) {
            console.log("Sudah subscribe sebelumnya, skip");
            return;
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        });
        console.log("Subscription berhasil:", subscription);

        const { endpoint, keys } = subscription.toJSON();

        const res = await fetch("/api/notification/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                endpoint,
                p256dh: keys?.p256dh,
                auth: keys?.auth,
            }),
        });
        console.log("Subscribe API response:", res.status);

    } catch (error) {
        console.error("Gagal register service worker:", error);
    }
}