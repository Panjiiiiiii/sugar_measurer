"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import TrukTable from "@/components/dashboard/TrukTable";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";

export default function TrukPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        // Clean up URL
        router.replace("/branch/truk");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#009262] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle size={24} weight="fill" />
            <span className="font-bold">Data Berhasil Disimpan</span>
          </div>
        </div>
      )}

      {/* Top section: Title and Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Truk</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/branch/dashboard" },
            { label: "Truk" }
          ]} 
        />
      </div>

      {/* Main Content: Table */}
      <TrukTable />
    </div>
  );
}
