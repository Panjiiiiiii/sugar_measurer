"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Export, 
  CaretDown, 
  Eye, 
} from "@phosphor-icons/react";
import { 
  StatCard, 
  Card, 
  Badge, 
  Pagination, 
  Button, 
  Select,
  ActionMenu
} from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DateFilterModal } from "@/components/dashboard/DateFilterModal";
import { BuktiTransaksiModal } from "@/components/dashboard/BuktiTransaksiModal";
import { BuktiTransferReceiptModal } from "@/components/dashboard/BuktiTransferReceiptModal";

interface TransactionData {
  id: string;
  transaction_date: string;
  loading_in: string;
  amount: string;
  status: "paid" | "unpaid";
  type: "Masuk" | "Keluar";
}

export default function TransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const role = (params.role as string) || "branch";

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isBuktiModalOpen, setIsBuktiModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: TransactionData[] = Array(12).fill(null).map((_, i) => ({
        id: (i + 1).toString(),
        transaction_date: "01/01/2026",
        loading_in: "15:00",
        amount: "1.000.000.000",
        status: i % 2 === 0 ? "paid" : "unpaid",
        type: i % 2 === 0 ? "Masuk" : "Keluar"
      }));
      
      setTransactions(mockData);
      setIsLoading(false);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <PageHeader 
        title="Riwayat Transaksi"
        extraActions={
          <div className="w-32">
            <Select 
              variant="compact"
              defaultValue="Month" 
              options={[{ value: "Month", label: "Month" }]} 
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Uang Masuk" value="Rp 1.000.000.000" label="Month" />
        <StatCard title="Uang Keluar" value="Rp 60.000.000" label="Month" />
        <StatCard title="Sisa Uang" value="Rp 940.000.000" label="Month" />
        <StatCard title="Total Transaksi Keluar" value="5.000" label="Month" />
      </div>

      <Card 
        title="Data Riwayat Transaksi" 
        noPadding
        headerAction={
          <div className="flex items-center gap-3">
            <Button 
              variant="white" 
              className="px-6 py-2 text-xs font-bold h-[40px] border-gray-100 min-w-[120px]"
              icon={<Export size={18} weight="bold" />}
            >
              Export
            </Button>
            <Button 
              variant="white" 
              className="px-6 py-2 text-xs font-bold h-[40px] border-gray-100 min-w-[120px]"
              onClick={() => setIsDateModalOpen(true)}
              icon={<CaretDown size={14} weight="bold" />}
              iconPosition="right"
            >
              Tanggal
            </Button>
            <Select 
              variant="compact"
              defaultValue="Status" 
              options={[
                { value: "Status", label: "Status" },
                { value: "Masuk", label: "Masuk" },
                { value: "Keluar", label: "Keluar" }
              ]} 
              className="min-w-[120px]"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-8 py-5">tanggal</th>
                <th className="px-4 py-5">Waktu</th>
                <th className="px-4 py-5">Jumlah Nominal</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-5"><div className="h-4 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center text-gray-400 text-sm">Tidak ada transaksi</td></tr>
              ) : (
                transactions.map((row) => (
                  <tr key={row.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-medium text-gray-600">{row.transaction_date}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">{row.loading_in}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">{row.amount}</td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={row.type === "Masuk" ? "success" : "danger"}
                        className="rounded-lg px-3 py-1 text-[10px] font-bold"
                      >
                        {row.type}
                      </Badge>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <button 
                        onClick={() => {
                          if (row.type === "Keluar") setIsBuktiModalOpen(true);
                          else setIsReceiptModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-white transition-all inline-flex items-center justify-center"
                      >
                        <Eye size={18} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && transactions.length > 0 && <Pagination />}
      </Card>

      <DateFilterModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} onApply={() => {}} />
      <BuktiTransaksiModal isOpen={isBuktiModalOpen} onClose={() => setIsBuktiModalOpen(false)} />
      <BuktiTransferReceiptModal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} />
    </div>
  );
}
