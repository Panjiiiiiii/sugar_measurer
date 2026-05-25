"use client";

import React from "react";
import {
  MagnifyingGlass,
  Bell,
  CaretDown
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

export default function FinanceHeader() {
  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-40">
      {/* Search Bar */}
      <div className="relative w-full max-w-md hidden md:block">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MagnifyingGlass size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          suppressHydrationWarning
          className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0095FF]/10 focus:border-[#0095FF] transition-all"
          placeholder="Search or type command..."
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <Link href="/finance/notification">
          <button 
            suppressHydrationWarning
            className="relative p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Bell size={24} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
            <Image
              src="https://avatar.iran.liara.run/public/boy?username=Emirhan"
              alt="User"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-[#0095FF] transition-colors">
              Emirhan Boruch
            </span>
            <CaretDown size={14} weight="bold" className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
