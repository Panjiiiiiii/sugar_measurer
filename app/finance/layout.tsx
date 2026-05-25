import React from "react";
import FinanceSidebar from "@/components/finance/FinanceSidebar";
import FinanceHeader from "@/components/finance/FinanceHeader";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <FinanceSidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <FinanceHeader />
        <main className="flex-1 mt-[72px] overflow-x-hidden w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
