import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import ManagerSidebar from "@/components/finance/ManagerSidebar";
import FinanceHeader from "@/components/finance/FinanceHeader";

export default async function DynamicDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }> | { role: string };
}) {
  // Support both promise and synchronous params in Next.js 15+
  const resolvedParams = params instanceof Promise ? await params : params;
  const role = resolvedParams?.role || "branch";
  const isFinanceOrManager = role === "finance" || role === "manager";

  if (isFinanceOrManager) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex">
        <ManagerSidebar />
        <div className="flex-1 flex flex-col ml-64 min-w-0">
          <FinanceHeader />
          <main className="flex-1 mt-[72px] overflow-x-hidden w-full">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Shared and dynamic */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 transition-all overflow-x-hidden">
        <Header />
        <main className="flex-1 p-8 pt-24 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
