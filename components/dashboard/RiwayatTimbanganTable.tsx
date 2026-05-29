"use client";

import React from "react";
import { Pagination } from "@/components/ui";
import { DotsThreeVertical, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Card, Badge, ActionMenu } from "@/components/ui";

interface RiwayatData {
  id: string;
  transaction_date: string;
  loading_in: string;
  loading_out: string;
  license_plate: string;
  driver_name: string;
  ownership_type: string;
  customer_name: string;
  bruto_weight: number;
  tarra_weight: number;
  netto_weight: number;
  total_price: number;
  payment_method: string;
  status: "paid" | "unpaid";
}

interface RiwayatTimbanganTableProps {
  data: RiwayatData[];
  isLoading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  pagination?: {
    per_page: number;
    number_page: number;
    total_page: number;
    total_data: number;
  };
  onPageChange?: (page: number) => void;
}

export function RiwayatTimbanganTable({ data, isLoading, onEdit, onDelete, onStatusChange, pagination, onPageChange }: RiwayatTimbanganTableProps) {
  const currentPage = pagination?.number_page ?? 1;
  const totalPages = pagination?.total_page ?? 1;
  const totalData = pagination?.total_data ?? data.length;
  const showingData = pagination?.per_page ?? data.length;

  const formatKw = (value: number) => `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((value || 0) / 100)} kw`;

  const formatRupiah = (value: number) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

  return (
    <Card title="Riwayat Timbangan" noPadding>
      <div className="px-8 pb-4 flex items-center gap-2">
        <Badge variant="blue">Today</Badge>
      </div>
      <div className="overflow-x-auto custom-scrollbar max-w-full">
        <div className="min-w-350">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="px-8 py-4">Tanggal</th>
                <th className="px-4 py-4">Masuk</th>
                <th className="px-4 py-4">Keluar</th>
                <th className="px-4 py-4">Nopol</th>
                <th className="px-4 py-4">Supir</th>
                <th className="px-4 py-4">Ownership</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Bruto</th>
                <th className="px-4 py-4">Tarre</th>
                <th className="px-4 py-4">Netto</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-8 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse h-15">
                    <td colSpan={14} className="px-8 py-4"><div className="h-4 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-8 py-10 text-center text-gray-400 text-sm">Tidak ada riwayat</td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors h-15">
                    <td className="px-8 py-4 text-xs font-medium text-gray-600">{item.transaction_date}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">{item.loading_in}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">{item.loading_out}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-900">{item.license_plate}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">{item.driver_name}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600 capitalize">{item.ownership_type}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">{item.customer_name}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">{formatKw(item.bruto_weight)}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">{formatKw(item.tarra_weight)}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-900">{formatKw(item.netto_weight)}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-900">{formatRupiah(item.total_price)}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600 capitalize">{item.payment_method}</td>
                    <td className="px-4 py-4">
                      <select 
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border-0 cursor-pointer appearance-none transition-all ${
                          item.status === "paid" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                        }`}
                        value={item.status}
                        disabled={item.status === "paid"}
                        onChange={(e) => onStatusChange(item.id, e.target.value)}
                      >
                        <option value="paid">PAID</option>
                        <option value="unpaid">UNPAID</option>
                      </select>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <ActionMenu 
                        trigger={
                          <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-white transition-all">
                            <DotsThreeVertical size={18} weight="bold" />
                          </button>
                        }
                        items={[
                          { label: "Detail", onClick: () => onEdit(item.id) },
                          { label: "Hapus", onClick: () => onDelete(item.id), variant: "danger" }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!isLoading && data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalData={totalData}
          showingData={data.length}
          onPageChange={onPageChange}
        />
      )}
    </Card>
  );
}
