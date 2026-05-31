"use client";

import React from "react";
import { CaretDown } from "@phosphor-icons/react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  icon?: React.ReactNode;
  variant?: "default" | "compact";
  placeholder?: string;
}

export function Select({ label, options, error, icon, variant = "default", className = "", placeholder, ...props }: SelectProps) {
  const isCompact = variant === "compact";

  return (
    <div className={`flex flex-col gap-2 w-full ${isCompact ? "gap-0" : ""}`}>
      {label && !isCompact && (
        <label className="text-xs font-bold text-gray-600">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        <select
          className={`w-full appearance-none cursor-pointer transition-all font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${
            isCompact 
              ? "px-4 py-2 text-xs rounded-xl border border-gray-100 bg-white hover:bg-gray-50 h-[40px] pr-10" 
              : "px-4 py-3 text-sm rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-300 focus:border-blue-500"
          } ${error ? "border-red-500" : ""} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors ${isCompact ? "right-3" : ""}`}>
          {icon || <CaretDown size={isCompact ? 14 : 18} weight="bold" />}
        </div>
      </div>
      {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
    </div>
  );
}
