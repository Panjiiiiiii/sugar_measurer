import React from "react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 font-medium">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <CaretRight size={12} weight="bold" className="text-gray-300" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
