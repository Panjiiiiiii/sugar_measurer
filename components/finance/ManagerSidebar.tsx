"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  SquaresFour,
  Scales,
  ArrowsLeftRight,
  User,
  MapPin,
  ChartLineUp,
  Users,
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

export default function ManagerSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const roleRaw = params.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "manager" : roleRaw;

  const DEFAULT_LOCATIONS = [
    { id: "loc-1", name: "Malang" },
    { id: "loc-2", name: "Blitar" },
    { id: "loc-3", name: "Kediri 1" },
    { id: "loc-4", name: "Kediri 2" },
  ];

  const [openMenus, setOpenMenus] = useState<string[]>(["Data Timbangan", "Data Transaksi"]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(DEFAULT_LOCATIONS);

  useEffect(() => {
    let isMounted = true;

    (async function fetchLocations() {
      try {
        const res = await axios.get("/api/location", { params: { page: 1, limit: 100 } });
        if (!isMounted) return;
        const data = res.data?.data ?? [];
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

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: SquaresFour,
      href: `/${role}/dashboard`,
    },
    {
      name: "Data Timbangan",
      icon: Scales,
      subItems: locations.length
        ? locations.map((loc) => ({ name: loc.name, href: `/${role}/timbangan/${loc.id}` }))
        : undefined,
    },
    {
      name: "Data Transaksi",
      icon: ArrowsLeftRight,
      subItems: locations.length
        ? locations.map((loc) => ({ name: loc.name, href: `/${role}/transaksi/${loc.id}` }))
        : undefined,
    },
    {
      name: "Data Customer",
      icon: User,
      href: `/${role}/customer`,
    },
    {
      name: "Data Lokasi",
      icon: MapPin,
      href: `/${role}/lokasi`,
    },
  ];

  // Riwayat Harga: finance and manager only
  if (role === "finance" || role === "manager") {
    menuItems.push({
      name: "Riwayat Harga",
      icon: ChartLineUp,
      href: `/${role}/harga-tebu`,
    });
  }

  // Add Data User for manager role flow
  if (role === "manager") {
    menuItems.push({
      name: "Data User",
      icon: Users,
      href: `/${role}/user`,
    });
  }

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
