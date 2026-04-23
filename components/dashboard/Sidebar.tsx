"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  SquaresFour, 
  Scales, 
  Truck, 
  ArrowsLeftRight,
  Lightning
} from "@phosphor-icons/react";

const menuItems = [
  {
    name: "Dashboard",
    icon: SquaresFour,
    href: "/branch/dashboard",
  },
  {
    name: "Data Timbangan",
    icon: Scales,
    href: "/branch/timbangan",
  },
  {
    name: "Data Truk",
    icon: Truck,
    href: "/branch/truk",
  },
  {
    name: "Riwayat Transfer",
    icon: ArrowsLeftRight,
    href: "/branch/transfer",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-60 h-full bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 transition-all">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Lightning weight="fill" className="text-white text-xl" />
        </div>
        <span className="font-bold text-gray-900 text-lg leading-tight">
          PT Musla Trans Utama
        </span>
      </div>

      {/* Menu Label */}
      <div className="px-6 py-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Menu
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon 
                    size={22} 
                    weight={isActive ? "fill" : "regular"} 
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
