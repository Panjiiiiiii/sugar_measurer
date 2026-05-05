import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, title, className = "", headerAction, noPadding = false }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-8"}>
        {children}
      </div>
    </div>
  );
}
