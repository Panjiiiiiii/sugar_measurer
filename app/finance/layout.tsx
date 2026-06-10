import React from "react";
import { headers } from "next/headers";
import FinanceSidebar from "@/components/finance/FinanceSidebar";
import FinanceHeader from "@/components/finance/FinanceHeader";
import PushNotificationInit from "@/components/PushNotificationInit";

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userId = headersList.get("x-user-id") ?? "";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex role-finance-manager">
      <FinanceSidebar />
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