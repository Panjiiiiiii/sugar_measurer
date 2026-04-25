import React, { useState, useEffect, useRef, Suspense } from "react";
import { Funnel, DotsThreeVertical, Plus } from "@phosphor-icons/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/dashboard/Pagination";
import FinanceActionMenu from "./FinanceActionMenu";
import FinanceTransferFilterModal from "./FinanceTransferFilterModal";
import FinanceBuktiTransferModal from "./FinanceBuktiTransferModal";
import FinanceDeleteModal from "./FinanceDeleteModal";

const transferData = [
  ...Array(5).fill({ tanggal: "01/01/2026", bukti: "tf212493.png", cabang: "Malang", nominal: "100.000.000" }),
  ...Array(5).fill({ tanggal: "05/04/2026", bukti: "tf212493.png", cabang: "Blitar", nominal: "100.000.000" }),
  ...Array(5).fill({ tanggal: "05/04/2026", bukti: "tf212493.png", cabang: "Kediri 1", nominal: "100.000.000" }),
  ...Array(5).fill({ tanggal: "05/04/2026", bukti: "tf212493.png", cabang: "Kediri 2", nominal: "100.000.000" }),
];

function TransferTableContent() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const branchFilter = searchParams.get("branch");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData = branchFilter
    ? transferData.filter(item => item.cabang.toLowerCase() === branchFilter.toLowerCase())
    : transferData;

  const handleApplyFilter = (filters: { start: string; end: string; branch: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.branch) {
      params.set("branch", filters.branch);
    } else {
      params.delete("branch");
    }
    router.push(`${pathname}?${params.toString()}`);
    setIsFilterOpen(false);
  };

  return (
    <div ref={containerRef} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-5 transition-all">
      {/* Filter Modal */}
      <FinanceTransferFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilter}
        initialFilters={{
          start: "2026-03-11",
          end: "2026-04-11",
          branch: branchFilter || "",
        }}
      />

      {/* Receipt Modal */}
      <FinanceBuktiTransferModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Data Riwayat Transfer</h3>
          {branchFilter && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg border border-blue-100 uppercase tracking-wider">
                {branchFilter}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Funnel size={18} weight="bold" />
            Filter
          </button>
          <Link
            href="/finance/transfer/add"
            className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-xl text-sm font-semibold hover:bg-[#2563EB] transition-all shadow-sm"
          >
            <Plus size={18} weight="bold" />
            Add
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-visible mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="pb-4">tanggal</th>
                <th className="pb-4">Bukti Transfer</th>
                <th className="pb-4">Cabang</th>
                <th className="pb-4">Jumlah Nominal</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((row, index) => (
                <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-xs font-medium text-gray-600 tracking-tight">{row.tanggal}</td>
                  <td className="py-4 text-xs font-medium text-gray-600 tracking-tight">{row.bukti}</td>
                  <td className="py-4 text-xs font-medium text-gray-600 tracking-tight">{row.cabang}</td>
                  <td className="py-4 text-xs font-medium text-gray-600 tracking-tight">{row.nominal}</td>
                  <td className="py-4 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === index ? null : index);
                      }}
                      className={`p-1.5 border rounded-lg transition-all focus:outline-none ${openMenuId === index
                          ? "border-gray-100 bg-white shadow-sm text-gray-900"
                          : "border-transparent text-gray-400 hover:border-gray-100 hover:bg-white hover:shadow-sm"
                        }`}
                    >
                      <DotsThreeVertical size={22} weight="bold" />
                    </button>

                    <FinanceActionMenu
                      isOpen={openMenuId === index}
                      onClose={() => setOpenMenuId(null)}
                      onViewReceipt={() => setIsReceiptOpen(true)}
                      onEdit={() => router.push(`/finance/transfer/edit/${index}`)}
                      onDelete={() => {
                        setSelectedId(index);
                        setIsDeleteOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <FinanceDeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          console.log("Deleted ID:", selectedId);
          setIsDeleteOpen(false);
          // Add deletion logic or success popup here
        }}
      />

      {/* Footer Info & Pagination */}
      <div className="flex flex-col items-center gap-6 mt-4">
        <p className="text-xs font-medium text-gray-400">{filteredData.length} data show from 100 data</p>
        <Pagination />
      </div>
    </div>
  );
}

export default function FinanceTransferTable() {
  return (
    <Suspense fallback={<div className="bg-white p-6 rounded-[32px] animate-pulse h-[400px]" />}>
      <TransferTableContent />
    </Suspense>
  );
}
