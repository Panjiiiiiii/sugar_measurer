"use client";

import React from "react";
import { 
  MagnifyingGlass, 
  Bell, 
  CaretDown 
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10 transition-all">
      {/* Search Bar */}
      <div className="relative w-[440px]">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <MagnifyingGlass size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="Search or type command..."
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link 
          href="/branch/notification"
          className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <Bell size={22} weight="regular" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Link>

        {/* User Profile */}
        <Link 
          href="/branch/profile"
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-200 border border-gray-100">
            <Image
              src="https://avatar.iran.liara.run/public/boy?username=Emirhan"
              alt="User"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900">
              Emirhan Boruch
            </span>
            <CaretDown size={12} weight="bold" className="text-gray-400" />
          </div>
        </Link>
      </div>
    </header>
  );
}
