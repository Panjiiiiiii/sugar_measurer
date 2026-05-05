"use client";

import React from "react";
import { Modal } from "@/components/ui";

interface ReceiptData {
  customer: string;
  nopol: string;
  masuk: string;
  keluar: string;
  bruto: string;
  tara: string;
  netto: string;
  hargaPerKw: string;
  total: string;
  operator: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData;
}

export function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const timeStr = today.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preview Struk" size="sm" centerTitle>
      <div className="bg-white p-2 flex flex-col items-center">
        {/* Receipt Paper Simulation */}
        <div className="w-full max-w-[300px] font-mono text-[11px] text-gray-800 flex flex-col gap-4">
          {/* Header */}
          <div className="text-center flex flex-col gap-0.5">
            <h3 className="text-sm font-bold uppercase tracking-wider">UD.FADJAR</h3>
            <p>Dsn.Bandarangin, Kec. Pagak</p>
            <p>Kab.Malang</p>
            <p className="mt-3">{dateStr} • {timeStr}</p>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-bold uppercase text-right max-w-[160px]">{data.customer || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Material</span>
              <span className="font-bold uppercase">TEBU</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nopol</span>
              <span className="font-bold uppercase">{data.nopol || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Masuk</span>
              <span className="font-bold tracking-tight">20-04-2026 {data.masuk || "00:00"}:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Keluar</span>
              <span className="font-bold tracking-tight">{data.keluar ? `20-04-2026 ${data.keluar}:00` : "-"}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-300 w-full" />

          {/* Weight Details */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Bruto</span>
              <span className="font-bold">{data.bruto || "0"}Kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tarra</span>
              <span className="font-bold">{data.tara || "0"}Kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Netto</span>
              <span className="font-bold">{data.netto || "0"}Kw</span>
            </div>
            {data.keluar && (
              <div className="flex justify-between">
                <span className="text-gray-500">keluar</span>
                <span className="font-bold tracking-tight">20-04-2026 {data.keluar}:00</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-300 w-full" />

          {/* Price Details */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Harga per kw</span>
              <span className="font-bold text-[12px]">Rp. {data.hargaPerKw},- /kw</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs font-bold uppercase">Total</span>
              <span className="font-bold text-[14px] text-gray-900">{data.total}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-300 w-full" />

          {/* Signature Section */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Operator</p>
            <div className="relative h-14 w-32 flex items-center justify-center">
              {/* Simple SVG for Signature Look */}
              <svg viewBox="0 0 100 40" className="w-full h-full text-gray-900">
                <path 
                  d="M10 30 Q 30 10 50 25 T 90 20" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <path 
                  d="M15 25 Q 35 35 55 20 T 85 30" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  opacity="0.6"
                />
              </svg>
            </div>
            <p className="font-bold uppercase text-gray-900 mt-1">{data.operator}</p>
          </div>

          {/* Bottom Space */}
          <div className="h-4" />
        </div>
      </div>
      
      <div className="mt-6 flex flex-col gap-3">
        <button 
          onClick={() => window.print()}
          className="w-full py-4 bg-[#009262] text-white rounded-2xl font-bold hover:bg-[#007a52] transition-all shadow-lg shadow-green-100"
        >
          Download / Print
        </button>
      </div>
    </Modal>
  );
}
