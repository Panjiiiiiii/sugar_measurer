import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
}

export function Input({ label, required, icon, helperText, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs font-bold text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <input
          className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
            icon ? "pr-10" : ""
          } ${className}`}
          {...props}
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {helperText && <p className="text-[10px] text-gray-400">{helperText}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}

export function Select({ label, required, options, icon, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs font-bold text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <select
          className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none pr-10 disabled:bg-gray-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {props.placeholder && <option value="">{props.placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      </div>
    </div>
  );
}
