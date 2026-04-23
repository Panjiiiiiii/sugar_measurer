"use client";

import React from "react";
import StatCard from "@/components/dashboard/StatCard";
import TonaseChart from "@/components/dashboard/TonaseChart";
import RiwayatTable from "@/components/dashboard/RiwayatTable";
import { 
  ArrowsLeftRight, 
  Bank, 
  Wallet 
} from "@phosphor-icons/react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Transaksi"
          value="3,782"
          icon={ArrowsLeftRight}
          trend="11.01%"
        />
        <StatCard
          label="Akumulasi Uang"
          value="100m"
          icon={Bank}
          trend="11.01%"
        />
        <StatCard
          label="Total Saldo"
          value="100m"
          icon={Wallet}
          trend="11.01%"
        />
      </div>

      {/* Chart Section */}
      <TonaseChart />

      {/* Table Section */}
      <RiwayatTable />
    </div>
  );
}
