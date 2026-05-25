"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  CaretDown,
  Export,
  Eye,
  DotsThreeVertical,
  CaretLeft,
  CaretRight,
  X
} from "@phosphor-icons/react";

const transaksiData = [
  { date: "01/01/2026", time: "15:00", amount: "Rp 1.000.000.000", status: "Masuk", action: "dots" },
  { date: "02/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "03/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "04/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "05/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "05/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "05/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "05/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "05/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "05/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "05/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
  { date: "05/04/2026", time: "15:00", amount: "Rp 10.000.000", status: "Keluar", action: "eye" },
];

export default function TransaksiLocationPage() {
  const params = useParams();
  const location = (params?.location as string) || "";
  const locationName = location.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const [selectedDate, setSelectedDate] = React.useState("Month");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = React.useState(false);
  const [isTanggalDropdownOpen, setIsTanggalDropdownOpen] = React.useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = React.useState(false);
  const [isBuktiModalOpen, setIsBuktiModalOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [rowToDelete, setRowToDelete] = React.useState<any>(null);

  const dateOptions = ["Today", "Week", "Month", "Year", "All"];
  const tanggalOptions = ["01/01/2026", "02/04/2026", "03/04/2026", "04/04/2026", "05/04/2026"];
  const statusOptions = ["Masuk", "Keluar"];

  const openBuktiModal = (row: any) => {
    setSelectedRow(row);
    setIsBuktiModalOpen(true);
    setActiveMenuId(null);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" 
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-[450px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-10 space-y-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 leading-relaxed px-4">
              Apakah anda yakin ingin menghapus data transaksi ini?
            </h3>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
              >
                Batal
              </button>
              <button 
                className="w-full py-3.5 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bukti Transaksi Modal */}
      {isBuktiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsBuktiModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-[400px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="py-6 px-8 flex items-center justify-between border-b border-gray-50">
              <div className="w-6"></div>
              <h2 className="text-xl font-bold text-gray-900">Bukti Transaksi</h2>
              <button
                onClick={() => setIsBuktiModalOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex justify-center bg-gray-50/10 overflow-y-auto max-h-[75vh]">
              {selectedRow?.status === "Masuk" ? (
                <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                  <img src="/bukti-transfer.png" alt="Bukti Transfer" className="w-full h-auto block" />
                </div>
              ) : (
                <div className="p-4 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto w-full">
                  <table className="w-full min-w-[1000px] text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-gray-50">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">tanggal</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Masuk</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Keluar</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nopol</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Supir</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ownership</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bruto</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tarre</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Netto</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">01/01/2026</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">15:00</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">16:00</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">N 1234 AC</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">Budi</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">Petani</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">Abah</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">100 kg</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">25 kg</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">10 kw</td>
                        <td className="px-6 py-5 text-sm font-bold text-gray-900 whitespace-nowrap">Rp 500.000</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">Cash</td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg uppercase">Paid</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi {locationName}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all min-w-[100px] justify-between shadow-sm"
              suppressHydrationWarning
            >
              {selectedDate}
              <CaretDown
                size={14}
                weight="bold"
                className={`transition-transform duration-200 ${isDateDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isDateDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDateDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {dateOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedDate(option);
                        setIsDateDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        selectedDate === option
                          ? "bg-blue-50 text-[#0095FF] font-bold"
                          : "text-gray-600 hover:bg-gray-50 font-medium"
                      }`}
                      suppressHydrationWarning
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link href={`/finance/transaksi/${location}/add`}>
            <button
              className="flex items-center gap-2 px-6 py-2 bg-[#0095FF] text-white rounded-xl text-sm font-bold hover:bg-[#0084FF] transition-all shadow-sm"
              suppressHydrationWarning
            >
              <Plus size={18} weight="bold" />
              Add
            </button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard label="Uang Masuk" value="Rp 1.000.000.000" tag={selectedDate} />
        <SummaryCard label="Uang Keluar" value="Rp 60.000.000" tag={selectedDate} />
        <SummaryCard label="Sisa Uang" value="Rp 940.000.000" tag={selectedDate} />
        <SummaryCard label="Total Transaksi Keluar" value="5.000" tag={selectedDate} />
      </div>

      {/* Data Riwayat Transfer */}
      <section className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-8 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-900">Data Riwayat Transfer</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              suppressHydrationWarning
            >
              <Export size={18} weight="bold" />
              Export
            </button>
            <div className="relative">
              <button
                onClick={() => setIsTanggalDropdownOpen(!isTanggalDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                suppressHydrationWarning
              >
                Tanggal
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`transition-transform duration-200 ${isTanggalDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isTanggalDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsTanggalDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {tanggalOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setIsTanggalDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                        suppressHydrationWarning
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                suppressHydrationWarning
              >
                Status
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isStatusDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setIsStatusDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                        suppressHydrationWarning
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-y border-gray-100">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">tanggal</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Waktu</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jumlah Nominal</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transaksiData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.date}</td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.time}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-900">{row.amount}</td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase ${
                        row.status === "Masuk" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      {row.status === "Masuk" ? (
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === i ? null : i)}
                            className={`p-2.5 rounded-xl transition-all border border-gray-100 shadow-sm hover:text-gray-900 ${
                              activeMenuId === i ? "bg-gray-50 text-gray-900" : "text-gray-400 hover:bg-gray-50"
                            }`}
                            suppressHydrationWarning
                          >
                            <DotsThreeVertical size={20} weight="bold" />
                          </button>
                          {activeMenuId === i && (
                            <>
                              <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenuId(null)}></div>
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-[70] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                  onClick={() => openBuktiModal(row)}
                                  className="w-full text-left px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                  suppressHydrationWarning
                                >
                                  Lihat Bukti Transfer
                                </button>
                                <Link href={`/finance/transaksi/${location}/edit/${i}`} className="w-full">
                                  <button
                                    className="w-full text-left px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                    suppressHydrationWarning
                                  >
                                    Edit
                                  </button>
                                </Link>
                                <button
                                  onClick={() => {
                                    setRowToDelete(row);
                                    setIsDeleteModalOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                                  suppressHydrationWarning
                                >
                                  Hapus
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => openBuktiModal(row)}
                          className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-all border border-gray-100 shadow-sm hover:text-gray-900"
                          suppressHydrationWarning
                        >
                          <Eye size={20} weight="bold" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-gray-50 flex flex-col items-center gap-6">
          <p className="text-xs font-bold text-gray-400">20 data show from 100 data</p>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all group"
              suppressHydrationWarning
            >
              <CaretLeft size={18} weight="bold" className="text-gray-400 group-hover:text-gray-900" />
              Previous
            </button>
            <div className="flex items-center gap-2">
              <button
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-[#0095FF] text-sm font-bold border border-blue-100"
                suppressHydrationWarning
              >
                1
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-bold"
                suppressHydrationWarning
              >
                2
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-bold"
                suppressHydrationWarning
              >
                3
              </button>
              <span className="w-12 h-12 flex items-center justify-center text-gray-400">...</span>
              <button
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-bold"
                suppressHydrationWarning
              >
                55
              </button>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all group"
              suppressHydrationWarning
            >
              Next
              <CaretRight size={18} weight="bold" className="text-gray-400 group-hover:text-gray-900" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, tag }: { label: string; value: string; tag: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-4 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg shrink-0">{tag}</span>
      </div>
      <div className="space-y-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 truncate" title={value}>
          {value}
        </h3>
        <span className="text-[11px] font-bold text-gray-400 block truncate">{label}</span>
      </div>
    </div>
  );
}
