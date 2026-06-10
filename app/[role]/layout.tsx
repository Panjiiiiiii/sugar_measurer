import React from "react";
import { headers } from "next/headers"; // tambah
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import ManagerSidebar from "@/components/finance/ManagerSidebar";
import FinanceHeader from "@/components/finance/FinanceHeader";
import PushNotificationInit from "@/components/PushNotificationInit";

export default async function DynamicDashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ role: string }> | { role: string };
}) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const role = resolvedParams?.role || "branch";
    const isFinanceOrManager = role === "finance" || role === "manager";

    // Ambil userId dari header yang sudah di-inject middleware
    const headersList = await headers();
    const userId = headersList.get("x-user-id") ?? "";

    if (isFinanceOrManager) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex role-finance-manager">
                <ManagerSidebar />
                <div className="flex-1 flex flex-col ml-64 min-w-0">
                    <FinanceHeader />
                    <main className="flex-1 mt-[72px] overflow-x-hidden w-full">
                        {userId && <PushNotificationInit userId={userId} />}
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex role-branch">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 transition-all overflow-x-hidden">
                <Header />
                <main className="flex-1 p-8 pt-24 overflow-x-hidden">
                    {userId && <PushNotificationInit userId={userId} />}
                    {children}
                </main>
            </div>
        </div>
    );
}