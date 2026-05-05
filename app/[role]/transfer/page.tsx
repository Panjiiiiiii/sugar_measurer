"use client";

import React from "react";
import { useParams } from "next/navigation";
import FinanceTransferTable from "@/components/finance/FinanceTransferTable";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function FinanceTransferPage() {
  const params = useParams();
  const role = Array.isArray(params.role) ? params.role[0] : (params.role || "finance");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Riwayat Transfer</h1>
        <Breadcrumbs 
          items={[
            { label: "Dashboard", href: `/${role}` },
            { label: "Riwayat Transfer", active: true }
          ]} 
        />
      </div>
      
      <FinanceTransferTable />
    </div>
  );
}
