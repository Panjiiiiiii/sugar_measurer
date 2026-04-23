"use client";

import React from "react";
import { IconProps } from "@phosphor-icons/react";
import { ArrowUpRight } from "@phosphor-icons/react";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType<IconProps>;
  trend: string;
}

export default function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-5 transition-all">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
        <Icon size={22} weight="regular" className="text-gray-900" />
      </div>
      
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold text-gray-900 leading-tight tracking-tight">{value}</h3>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold">
            <ArrowUpRight size={14} weight="bold" />
            <span>{trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
