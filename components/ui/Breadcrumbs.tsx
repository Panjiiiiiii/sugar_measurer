import React from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-gray-400">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={item.active || index === items.length - 1 ? "text-gray-900" : ""}>
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <CaretRight size={12} weight="bold" className="text-gray-300" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
