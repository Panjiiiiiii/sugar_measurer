import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "orange" | "slate" | "gray" | "success" | "danger";
  className?: string;
}

export function Badge({ children, variant = "slate", className = "" }: BadgeProps) {
  const variants = {
    blue: "bg-blue-50 text-[#00A3FF] border-blue-100",
    green: "bg-[#E6F6EF] text-[#10B981] border-[#D1FAE5]",
    orange: "bg-[#FFF4E6] text-[#F97316] border-[#FFEDD5]",
    slate: "bg-slate-50 text-slate-400 border-slate-100",
    gray: "bg-gray-50 text-gray-400 border-gray-100",
    success: "bg-[#E6F6EF] text-[#009262] border-transparent",
    danger: "bg-[#FFEEEE] text-[#FF0000] border-transparent",
  };

  return (
    <span className={`px-3 py-1 text-[10px] font-bold rounded-full inline-flex items-center justify-center ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
