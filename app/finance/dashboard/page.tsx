"use client";

import React from "react";
import StatCard from "@/components/dashboard/StatCard";
import FinanceChart from "@/components/finance/FinanceChart";
import LocationCard from "@/components/finance/LocationCard";
import { Bank, ArrowsLeftRight, Scales } from "@phosphor-icons/react";

export default function FinanceDashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Uang"
          value="100m"
          icon={Bank}
          trend="+ 11.01%"
        />
        <StatCard 
          label="Total Transaksi"
          value="3,782"
          icon={ArrowsLeftRight}
          trend="+ 11.01%"
        />
        <StatCard 
          label="Total Tonase"
          value="1000 Ton"
          icon={Scales}
          trend="+ 11.01%"
        />
      </div>

      {/* Chart */}
      <FinanceChart />

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LocationCard 
          name="Malang"
          totalKas="Rp 800 Jt"
          transaksi={45}
          tonase="300"
          hargaTebu="Rp 500"
        />
        <LocationCard 
          name="Blitar"
          totalKas="Rp 800 Jt"
          transaksi={45}
          tonase="300"
          hargaTebu="Rp 500"
        />
        <LocationCard 
          name="Kediri 1"
          totalKas="Rp 800 Jt"
          transaksi={45}
          tonase="300"
          hargaTebu="Rp 500"
        />
        <LocationCard 
          name="Kediri 2"
          totalKas="Rp 800 Jt"
          transaksi={45}
          tonase="300"
          hargaTebu="Rp 500"
        />
      </div>
    </div>
  );
}
