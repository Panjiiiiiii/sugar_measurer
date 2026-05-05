"use client";

import React from "react";
import { Modal } from "@/components/ui";

interface BuktiTransferReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuktiTransferReceiptModal({ isOpen, onClose }: BuktiTransferReceiptModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Bukti Transaksi"
      centerTitle
      size="md"
    >
      <div className="flex justify-center items-center bg-gray-50 rounded-3xl p-6 overflow-hidden">
        {/* Mockup Receipt - mimicking the image provided */}
        <div className="w-full max-w-[320px] bg-[#00529C] rounded-[40px] overflow-hidden shadow-2xl flex flex-col relative aspect-[9/19]">
          {/* Top Bar */}
          <div className="p-4 flex justify-between items-center text-white/80 text-[10px] font-bold">
            <span>12.13</span>
            <div className="flex gap-1 items-center">
              <div className="w-3 h-3 border border-white/40 rounded-full" />
              <span>89</span>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white mx-4 mb-4 rounded-[32px] flex-1 flex flex-col p-6 items-center gap-4 text-center">
            <h3 className="text-[#00529C] font-black text-lg mt-4">m-Transfer</h3>
            
            <div className="w-full border-t border-dashed border-gray-200 pt-4 flex flex-col gap-4 text-left">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Bank</span>
                <span className="text-xs font-black text-[#00529C]">SEABANK</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Ke Rekening Tujuan</span>
                <span className="text-xs font-black text-[#00529C]">901337178004 - DADING ATHALLAH</span>
              </div>

              <div className="bg-[#E6F4FF] p-4 rounded-2xl flex flex-col gap-2">
                <span className="text-[11px] font-black text-[#00529C]">m-Transfer: BERHASIL</span>
                <span className="text-[10px] font-bold text-[#00529C]/70">12/04/2026 12:13:21</span>
                
                <div className="mt-2 flex flex-col gap-1 text-[10px] font-bold text-[#00529C]">
                  <p>NOMINAL TRANSFER Rp 56,666.00</p>
                  <p>BIAYA Rp 2,500.00</p>
                  <p>LAYANAN BI FAST</p>
                  <p>BERITA dading kontol</p>
                  <p>TUJUAN TRANSAKSI Pemindahan Dana</p>
                </div>
              </div>
            </div>

            {/* Bottom Buttons Mockup */}
            <div className="mt-auto w-full flex items-center justify-between gap-3 pt-4">
              <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[#00529C]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </div>
              <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[#00529C]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <button className="flex-1 bg-gradient-to-r from-[#007ADF] to-[#00529C] text-white font-black text-sm py-3 rounded-xl shadow-lg shadow-blue-500/20">
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
