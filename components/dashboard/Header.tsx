"use client";

import React from "react";
import {
  MagnifyingGlass,
  Bell,
  CaretDown
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import LogoutModal from "./LogoutModal";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const params = useParams();
  const pathname = usePathname();
  const roleRaw = params.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "branch" : roleRaw;

  // Navigation tracking for dynamic breadcrumbs
  React.useEffect(() => {
    const mainPages = ["timbangan", "truk", "customer", "transaksi"];
    const currentPage = mainPages.find(page => pathname.includes(`/${role}/${page}`));
    
    if (currentPage) {
      const pageLabels: Record<string, string> = {
        timbangan: "Timbangan",
        truk: "Data Truk",
        customer: "Data Customer",
        transaksi: "Riwayat Transaksi"
      };
      
      sessionStorage.setItem("lastMainPage", JSON.stringify({
        label: pageLabels[currentPage],
        href: `/${role}/${currentPage}`
      }));
    }
  }, [role, pathname]);

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-40 transition-all">
        {/* Search Bar */}
        <div className="relative w-[440px]">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <MagnifyingGlass size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Search..."
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link
            href={`/${role}/notification`}
            className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Bell size={22} weight="regular" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Link>

          {/* User Profile Section */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 cursor-pointer p-1 rounded-xl transition-all ${isDropdownOpen ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
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
                <CaretDown
                  size={12}
                  weight="bold"
                  className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Invisible Backdrop to Close Dropdown */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href={`/${role}/profile`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50/50 transition-colors border-t border-gray-50"
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onLogout={() => {
          console.log("Logging out...");
          setIsLogoutModalOpen(false);
        }}
      />
    </>
  );
}
