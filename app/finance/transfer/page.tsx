"use client";

import React from "react";
import FinanceTransferTable from "@/components/finance/FinanceTransferTable";
import Breadcrumb from "@/components/dashboard/Breadcrumb";

export default function FinanceTransferPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Riwayat Transfer</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/finance/dashboard" },
            { label: "Riwayat Transfer" }
          ]} 
        />
      </div>
      
      <FinanceTransferTable />
    </div>
  );
}
