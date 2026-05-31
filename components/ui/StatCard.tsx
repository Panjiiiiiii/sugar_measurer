import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  title?: string;
  subValue?: string;
  className?: string;
}

export function StatCard({ label, value, title, subValue, className = "" }: StatCardProps) {
  const displayTitle = title || subValue || "";

  return (
    <div className={`bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-5 items-start transition-all hover:shadow-md ${className}`}>
      <span className="px-4 py-1.5 bg-[#F8F9FA] text-[#6C757D] text-[11px] font-bold rounded-xl tracking-tight uppercase">
        {label}
      </span>
      <div className="flex flex-col gap-1 items-start text-left">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{value}</h2>
        <span className="text-[13px] font-bold text-[#A0AEC0] tracking-tight">{displayTitle}</span>
      </div>
    </div>
  );
}
