"use client";

import React from "react";
import { 
  Funnel, 
  Eye, 
  DotsThreeVertical 
} from "@phosphor-icons/react";
import Link from "next/link";

const tableData = [
  {
    tanggal: "01/01/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Paid",
  },
  {
    tanggal: "02/04/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Unpaid",
  },
  {
    tanggal: "03/04/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Paid",
  },
  {
    tanggal: "04/04/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Unpaid",
  },
  {
    tanggal: "05/04/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Paid",
  },
];

export default function RiwayatTable() {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-6 transition-all">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Riwayat Timbangan</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <Funnel size={16} weight="bold" />
            Filter
          </button>
          <Link 
            href="/branch/timbangan"
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} weight="bold" />
            See all
          </Link>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">tanggal</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Nopol</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Nama</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Ownership</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Netto</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Ammount</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tableData.map((row, index) => (
              <tr key={index} className="group">
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.tanggal}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.nopol}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.nama}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.ownership}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.netto}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.ammount}</td>
                <td className="py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    row.status === "Paid" 
                      ? "bg-green-50 text-green-600" 
                      : "bg-orange-50 text-orange-600"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-right whitespace-nowrap">
                  <button className="p-1.5 border border-transparent rounded-lg text-gray-400 hover:border-gray-100 hover:bg-gray-50 transition-all">
                    <DotsThreeVertical size={18} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
