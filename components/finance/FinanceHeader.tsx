"use client";

import React, { useState } from "react";
import {
  Bell,
  CaretDown
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import LogoutModal from "../dashboard/LogoutModal";

export default function FinanceHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const router = useRouter();
  const params = useParams();

  const roleRaw = params?.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "finance" : roleRaw;

  React.useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return;

        const json = await res.json();
        const name = json?.data?.name;

        if (!cancelled && typeof name === "string" && name.trim()) {
          setUserName(name);
        }
      } catch {
        // Keep fallback name on fetch failure.
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (_) {}
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
    router.push("/auth/login");
  };

  return (
    <>
      <header className="header-container h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-40">
        {/* Empty spacer replacing search bar */}
        <div />

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <Link href={`/${role}/notification`}>
            <button 
              suppressHydrationWarning
              className="relative p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Bell size={24} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </Link>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 pl-2 cursor-pointer p-1 rounded-xl transition-all ${
                isDropdownOpen ? "bg-gray-50" : "hover:bg-gray-50/85"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {userName}
                </span>
                <CaretDown 
                  size={14} 
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

                <div className="user-dropdown absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1.5">
                  <Link
                    href={`/${role}/profile`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="profile-link flex items-center px-4 py-2.5 text-sm font-medium transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="logout-button w-full flex items-center px-4 py-2.5 text-sm font-medium transition-colors"
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
        onLogout={handleLogout}
      />
    </>
  );
}