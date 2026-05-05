"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Funnel, DotsThreeVertical, Plus } from "@phosphor-icons/react";
import { useSearchParams, useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

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
  const params = useParams();
  const role = Array.isArray(params.role) ? params.role[0] : (params.role || "finance");
  
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
    <Card 
      title="Data Riwayat Transfer" 
      noPadding
      headerAction={
        <div className="flex items-center gap-3">
          {branchFilter && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <Badge variant="blue">{branchFilter}</Badge>
            </div>
          )}
          <Button 
            variant="white" 
            size="md" 
            onClick={() => setIsFilterOpen(true)}
            icon={<Funnel size={18} weight="bold" />}
          >
            Filter
          </Button>
          <Link href={`/${role}/transfer/add`}>
            <Button 
              variant="secondary" 
              size="md" 
              icon={<Plus size={18} weight="bold" />}
            >
              Add
            </Button>
          </Link>
        </div>
      }
    >
      <div ref={containerRef}>
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

        <FinanceBuktiTransferModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />

        <div className="overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-8 py-4">tanggal</th>
                  <th className="px-4 py-4">Bukti Transfer</th>
                  <th className="px-4 py-4">Cabang</th>
                  <th className="px-4 py-4">Jumlah Nominal</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((row, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-medium text-gray-600 tracking-tight">{row.tanggal}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600 tracking-tight">{row.bukti}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600 tracking-tight">{row.cabang}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600 tracking-tight">{row.nominal}</td>
                    <td className="px-8 py-4 text-right relative">
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
                        onEdit={() => router.push(`/${role}/transfer/edit/${index}`)}
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

        <FinanceDeleteModal 
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => {
            console.log("Deleted ID:", selectedId);
            setIsDeleteOpen(false);
          }}
        />

        <Pagination 
          showingData={filteredData.length} 
          totalData={100} 
        />
      </div>
    </Card>
  );
}

export default function FinanceTransferTable() {
  return (
    <Suspense fallback={<Card className="animate-pulse h-[400px]">{null}</Card>}>
      <TransferTableContent />
    </Suspense>
  );
}
