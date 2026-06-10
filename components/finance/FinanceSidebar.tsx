"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Scales,
  ArrowsLeftRight,
  User,
  MapPin,
  CaretDown,
  Lightning,
  Sun,
  Moon
} from "@phosphor-icons/react";
import axios from "@/lib/axios";
import { useTheme } from "@/components/ThemeProvider";

interface MenuItem {
  name: string;
  icon: any;
  href?: string;
  subItems?: { name: string; href: string }[];
}

export default function FinanceSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const DEFAULT_LOCATIONS = [
    { id: "loc-1", name: "Malang" },
    { id: "loc-2", name: "Blitar" },
    { id: "loc-3", name: "Kediri 1" },
    { id: "loc-4", name: "Kediri 2" },
  ];

  const [openMenus, setOpenMenus] = useState<string[]>(["Data Timbangan", "Data Transaksi"]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async function fetchLocations() {
      try {
        const res = await axios.get("/api/location", { params: { page: 1, limit: 100 } });
        if (!isMounted) return;
        const data = res.data?.data ?? [];
        // normalize to expected shape
        const mapped = data.map((l: any) => ({ id: l.id, name: l.name }));
        setLocations(mapped);
      } catch (err) {
        console.error("Failed to fetch locations for sidebar:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const ID_TO_SLUG: Record<string, string> = {
    "loc-1": "malang",
    "loc-2": "blitar",
    "loc-3": "kediri-1",
    "loc-4": "kediri-2",
  };

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: SquaresFour,
      href: "/finance/dashboard",
    },
    {
      name: "Data Timbangan",
      icon: Scales,
      subItems: locations?.length
        ? locations.map((loc) => {
            const slug = ID_TO_SLUG[loc.id] || loc.id;
            return { name: loc.name, href: `/finance/timbangan/${slug}` };
          })
        : undefined,
    },
    {
      name: "Data Transaksi",
      icon: ArrowsLeftRight,
      subItems: locations?.length
        ? locations.map((loc) => {
            const slug = ID_TO_SLUG[loc.id] || loc.id;
            return { name: loc.name, href: `/finance/transaksi/${slug}` };
          })
        : undefined,
    },
    {
      name: "Data Customer",
      icon: User,
      href: "/finance/customer",
    },
    {
      name: "Data Lokasi",
      icon: MapPin,
      href: "/finance/lokasi",
    },
  ];

  return (
    <div className="sidebar-container w-64 h-full bg-white border-r border-[#F3F4F6] flex flex-col fixed left-0 top-0 z-50">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#0095FF] rounded-lg flex items-center justify-center shrink-0">
          <Lightning weight="fill" className="text-white text-lg" />
        </div>
        <span className="font-bold text-[#111827] text-base leading-tight">
          PT Musla Trans<br />Utama
        </span>
      </div>

      {/* Menu Label */}
      <div className="px-6 py-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Menu
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <ul className="space-y-1 pb-20">
          {menuItems.map((item) => {
            const isSubMenu = !!item.subItems;
            const isOpen = openMenus.includes(item.name);
            const isActive = item.href === pathname || (item.subItems?.some(sub => sub.href === pathname));

            return (
              <li key={item.name} className="flex flex-col">
                {isSubMenu ? (
                  <>
                    <button
                      suppressHydrationWarning
                      onClick={() => toggleMenu(item.name)}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all ${
                        isActive ? "text-[#111827]" : "text-[#6B7280] hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon 
                          size={20} 
                          weight={isActive ? "fill" : "regular"} 
                          className={isActive ? "text-[#111827]" : "text-[#6B7280]"}
                        />
                        <span className={`text-sm ${isActive ? "font-bold" : "font-semibold"}`}>
                          {item.name}
                        </span>
                      </div>
                      <CaretDown
                        size={14}
                        weight="bold"
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <ul className="mt-1 ml-9 space-y-1">
                        {item.subItems?.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              className={`block px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                                pathname === sub.href
                                  ? "text-[#111827] bg-[#F3F4F6]/50"
                                  : "text-[#9CA3AF] hover:text-[#111827]"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      pathname === item.href
                        ? "bg-[#F3F4F6]/50 text-[#111827]"
                        : "text-[#6B7280] hover:bg-gray-50/50"
                    }`}
                  >
                    <item.icon 
                      size={20} 
                      weight={pathname === item.href ? "fill" : "regular"}
                      className={pathname === item.href ? "text-[#111827]" : "text-[#6B7280]"}
                    />
                    <span className={`text-sm ${pathname === item.href ? "font-bold" : "font-semibold"}`}>
                      {item.name}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-zinc-800/80 mt-auto">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[#6B7280] hover:bg-gray-50/50 cursor-pointer"
        >
          {!mounted ? (
            <>
              <Moon size={20} weight="regular" />
              <span className="text-sm font-semibold text-[#6B7280]">Mode Gelap</span>
            </>
          ) : theme === "light" ? (
            <>
              <Moon size={20} weight="regular" />
              <span className="text-sm font-semibold text-[#6B7280]">Mode Gelap</span>
            </>
          ) : (
            <>
              <Sun size={20} weight="regular" />
              <span className="text-sm font-semibold text-[#6B7280]">Mode Terang</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
