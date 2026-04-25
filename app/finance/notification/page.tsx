"use client";

import React from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import { 
  Funnel, 
  Checks, 
  ArrowsLeftRight, 
  Bank,
  CheckCircle
} from "@phosphor-icons/react";
import Link from "next/link";
import FinanceNotificationFilterModal from "@/components/finance/FinanceNotificationFilterModal";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: "transfer" | "bank";
}

const notificationsToday: Notification[] = [
  { id: 1, title: "Transaksi masuk", description: "Transaksi masuk Sebesar 100.000.000", time: "15.00", isRead: false, type: "transfer" },
  { id: 2, title: "Uang Cabang Malang Tersisa 100.000.000", description: "Transfer ke cabang malang untuk transaksi kedepannya", time: "15.00", isRead: false, type: "bank" },
  { id: 3, title: "Transaksi masuk", description: "Transaksi masuk Sebesar 100.000.000", time: "15.00", isRead: false, type: "transfer" },
  { id: 4, title: "Uang Cabang Malang Tersisa 100.000.000", description: "Transfer ke cabang malang untuk transaksi kedepannya", time: "15.00", isRead: false, type: "bank" },
  { id: 5, title: "Transaksi masuk", description: "Transaksi masuk Sebesar 100.000.000", time: "15.00", isRead: false, type: "transfer" },
];

const notificationsYesterday: Notification[] = [
  { id: 6, title: "Transaksi masuk", description: "Transaksi masuk Sebesar 100.000.000", time: "15.00", isRead: true, type: "transfer" },
  { id: 7, title: "Uang Cabang Malang Tersisa 100.000.000", description: "Transfer ke cabang malang untuk transaksi kedepannya", time: "15.00", isRead: false, type: "bank" },
  { id: 8, title: "Transaksi masuk", description: "Transaksi masuk Sebesar 100.000.000", time: "15.00", isRead: true, type: "transfer" },
  { id: 9, title: "Uang Cabang Malang Tersisa 100.000.000", description: "Transfer ke cabang malang untuk transaksi kedepannya", time: "15.00", isRead: true, type: "bank" },
  { id: 10, title: "Transaksi masuk", description: "Transaksi masuk Sebesar 100.000.000", time: "15.00", isRead: true, type: "transfer" },
];

export default function NotificationPage() {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const handleApplyFilter = (data: any) => {
    console.log("Applying filters:", data);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Modal */}
      <FinanceNotificationFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilter}
      />
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifikasi</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/finance/dashboard" },
            { label: "Notifikasi" }
          ]} 
        />
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-end gap-3">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <Funnel size={18} weight="bold" />
          Filter
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm">
          <Checks size={20} weight="bold" className="text-gray-900" />
          Tandai sudah di baca semua
        </button>
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-10">
        {/* Today Group */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hari ini</span>
              <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-black rounded-full border border-red-100">8</span>
            </div>
            <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Checks size={18} weight="bold" />
              <span className="text-xs font-bold">Tandai sudah di baca semua</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {notificationsToday.map((notif) => (
              <NotificationCard key={notif.id} notif={notif} />
            ))}
          </div>
        </div>

        {/* Yesterday Group */}
        <div className="flex flex-col gap-6">
          <div className="px-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kemarin</span>
          </div>
          <div className="flex flex-col gap-3">
            {notificationsYesterday.map((notif) => (
              <NotificationCard key={notif.id} notif={notif} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ notif }: { notif: Notification }) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-gray-50 shadow-sm hover:shadow-md transition-all flex items-start justify-between group cursor-pointer relative overflow-hidden">
      <div className="flex items-start gap-6">
        {/* Icon Container */}
        <div className="p-4 bg-gray-50 rounded-2xl text-gray-900 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
          {notif.type === "transfer" ? (
            <ArrowsLeftRight size={24} weight="bold" />
          ) : (
            <Bank size={24} weight="bold" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 pt-1">
          <h4 className="text-base font-bold text-gray-900 tracking-tight leading-none">
            {notif.title}
          </h4>
          <p className="text-sm font-medium text-gray-400 leading-relaxed">
            {notif.description}
          </p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-col items-end gap-3 pt-1">
        <span className="text-xs font-bold text-gray-400">{notif.time}</span>
        {!notif.isRead && (
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" />
        )}
      </div>

      {/* Unread Status Indicator Bar (Optional matching dot) */}
      {!notif.isRead && (
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
