"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/registerSW";

export default function PushNotificationInit({ userId }: { userId: string }) {
    useEffect(() => {
        registerServiceWorker(userId);
    }, [userId]);

    return null;
}