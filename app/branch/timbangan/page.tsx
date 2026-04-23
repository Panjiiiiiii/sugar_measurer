"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import TimbanganTable from "@/components/dashboard/TimbanganTable";
import Pagination from "@/components/dashboard/Pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, X } from "@phosphor-icons/react";

export default function TimbanganPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowToast(true);
      
      // Cleanup the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#009262] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 min-w-[320px]">
            <CheckCircle size={24} weight="fill" />
            <span className="font-bold flex-1">Data Berhasil Disimpan</span>
            <button 
              onClick={() => setShowToast(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Top section: Title and Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Timbangan</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/branch/dashboard" },
            { label: "Timbangan" }
          ]} 
        />
      </div>

      {/* Main Content: Table and Pagination */}
      <div className="flex flex-col gap-4">
        <TimbanganTable />
        <Pagination />
      </div>
    </div>
  );
}
