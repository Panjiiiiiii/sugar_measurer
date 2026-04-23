"use client";

import React from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import TransferTable from "@/components/dashboard/TransferTable";

export default function RiwayatTransferPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Top section: Title and Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transfer</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/branch/dashboard" },
            { label: "Riwayat Transfer" }
          ]} 
        />
      </div>

      {/* Main Content: Table */}
      <TransferTable />
    </div>
  );
}
