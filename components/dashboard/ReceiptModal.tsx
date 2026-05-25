"use client";

import React from "react";
import { Modal } from "@/components/ui";
import jsPDF from "jspdf";

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

  function printReceiptJsPDF(data: ReceiptData) {
    // Ukuran kertas: 14cm x 24.1cm (portrait)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [140, 241],
    });

    const W = 140;
    const margin = 10;
    const lineH = 5;
    let y = 12;

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

    // ── HEADER ──────────────────────────────────────
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text("UD.FADJAR", W / 2, y, { align: "center" });
    y += lineH;

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.text("Dsn.Bandarangin, Kec. Pagak", W / 2, y, { align: "center" });
    y += lineH - 1;
    doc.text("Kab.Malang", W / 2, y, { align: "center" });
    y += lineH;

    doc.setTextColor(150);
    doc.text(`${dateStr}  •  ${timeStr}`, W / 2, y, { align: "center" });
    doc.setTextColor(0);
    y += lineH + 3;

    // ── DETAIL ROW HELPER ───────────────────────────
    const row = (label: string, value: string, bold = false) => {
      doc.setFont("courier", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(130);
      doc.text(label, margin, y);
      doc.setTextColor(0);
      if (bold) doc.setFont("courier", "bold");
      doc.text(value, W - margin, y, { align: "right" });
      doc.setFont("courier", "normal");
      y += lineH;
    };

    // ── DASHER HELPER ────────────────────────────────
    const dash = () => {
      const dashLen = 2,
        gapLen = 2;
      let x = margin;
      const end = W - margin;
      doc.setDrawColor(200);
      doc.setLineWidth(0.2);
      while (x < end) {
        doc.line(x, y, Math.min(x + dashLen, end), y);
        x += dashLen + gapLen;
      }
      y += 4;
    };

    // ── INFO ROWS ────────────────────────────────────
    row("Customer", (data.customer || "-").toUpperCase(), true);
    row("Material", "TEBU", true);
    row("Nopol", (data.nopol || "-").toUpperCase(), true);
    row("Masuk", `20-04-2026 ${data.masuk || "00:00"}:00`, true);
    if (data.keluar) row("Keluar", `20-04-2026 ${data.keluar}:00`, true);
    y += 2;

    // ── BERAT ────────────────────────────────────────
    dash();
    row("Bruto", `${data.bruto || "0"}Kg`, true);
    row("Tarra", `${data.tara || "0"}Kg`, true);
    row("Netto", `${data.netto || "0"}Kw`, true);
    y += 2;

    // ── HARGA ────────────────────────────────────────
    dash();
    row("Harga per kw", `Rp. ${data.hargaPerKw},- /kw`);

    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text("Total", margin, y);

    doc.setFontSize(12);
    doc.text(data.total, W - margin, y, { align: "right" });
    y += lineH + 3;

    // ── SIGNATURE ────────────────────────────────────
    dash();
    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150);
    doc.text("OPERATOR", W / 2, y, { align: "center" });
    y += lineH + 2;

    // Signature SVG path (kurva tanda tangan)
    y+= 18;

    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text((data.operator || "").toUpperCase(), W / 2, y, {
      align: "center",
    });

    // ── OUTPUT ───────────────────────────────────────
    doc.autoPrint();
    doc.output("dataurlnewwindow");
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Struk"
      size="sm"
      centerTitle
    >
      <div className="bg-white flex flex-col items-center">
        {/* Receipt Paper Simulation */}
        <div className="w-full max-w-[240px] font-mono text-[10px] text-gray-800 flex flex-col gap-3">
          {/* Header */}
          <div className="text-center flex flex-col gap-0.5 pt-2">
            <h3 className="text-[12px] font-bold uppercase tracking-wider">
              UD.FADJAR
            </h3>
            <p className="text-[9px]">Dsn.Bandarangin, Kec. Pagak</p>
            <p className="text-[9px]">Kab.Malang</p>
            <p className="mt-2 text-[9px] opacity-70">
              {dateStr} • {timeStr}
            </p>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-1.5 px-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-bold uppercase text-right max-w-[140px]">
                {data.customer || "-"}
              </span>
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
              <span className="font-bold tracking-tight">
                20-04-2026 {data.masuk || "00:00"}:00
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Keluar</span>
              <span className="font-bold tracking-tight">
                {data.keluar ? `20-04-2026 ${data.keluar}:00` : "-"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 w-full" />

          {/* Weight Details */}
          <div className="flex flex-col gap-1.5 px-1">
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
                <span className="font-bold tracking-tight">
                  20-04-2026 {data.keluar}:00
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 w-full" />

          {/* Price Details */}
          <div className="flex flex-col gap-1.5 px-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Harga per kw</span>
              <span className="font-bold text-[11px]">
                Rp. {data.hargaPerKw},- /kw
              </span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-[10px] font-bold uppercase">Total</span>
              <span className="font-bold text-[13px] text-gray-900">
                {data.total}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 w-full" />

          {/* Signature Section */}
          <div className="mt-2 flex flex-col items-center gap-1">
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold">
              Operator
            </p>
            <br/>
            <br/>
            <p className="font-bold uppercase text-[9px] text-gray-900">
              {data.operator}
            </p>
          </div>

          {/* Bottom Space */}
          <div className="h-2" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={() => printReceiptJsPDF(data)}
          className="w-full py-4 bg-[#009262] text-white rounded-2xl font-bold hover:bg-[#007a52] transition-all shadow-lg shadow-green-100"
        >
          Download / Print
        </button>
      </div>
    </Modal>
  );
}
