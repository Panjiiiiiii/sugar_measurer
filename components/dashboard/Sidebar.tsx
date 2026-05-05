"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { 
  Scales, 
  Truck, 
  User,
  ArrowsLeftRight,
  Lightning
} from "@phosphor-icons/react";

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  
  const roleRaw = params.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "branch" : roleRaw;

  const menuItems = [
    {
      name: "Timbangan",
      icon: Scales,
      href: `/${role}/timbangan`,
    },
    {
      name: "Data Truk",
      icon: Truck,
      href: `/${role}/truk`,
    },
    {
      name: "Data Customer",
      icon: User,
      href: `/${role}/customer`,
    },
    {
      name: "Riwayat Transaksi",
      icon: ArrowsLeftRight,
      href: `/${role}/transaksi`,
    },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 transition-all z-50">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
          <Lightning weight="fill" className="text-white text-xl" />
        </div>
        <span className="font-bold text-gray-900 text-lg leading-tight">
          PT Musla Trans Utama
        </span>
      </div>

      {/* Menu Label */}
      <div className="px-6 py-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
          Menu
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-50/80 text-[#2563EB]"
                      : "text-[#64748B] hover:bg-gray-50/80 hover:text-gray-900"
                  }`}
                >
                  <Icon 
                    size={22} 
                    weight={isActive ? "fill" : "bold"} 
                  />
                  <span className={`text-sm font-bold ${isActive ? "text-[#2563EB]" : "text-[#64748B]"}`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
