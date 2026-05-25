"use client";

import React, { useState } from "react";
import { 
  Funnel, 
  Checks, 
  ArrowsLeftRight, 
  Wallet,
  Check
} from "@phosphor-icons/react";
import NotificationFilterModal from "@/components/dashboard/NotificationFilterModal";

const notifications = [
  {
    id: 1,
    type: "transaction",
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 2,
    type: "wallet",
    title: "Uang Cabang Malang Tersisa 100.000.000",
    description: "Transfer ke cabang malang untuk transaksi kedepannya",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 3,
    type: "transaction",
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 4,
    type: "wallet",
    title: "Uang Cabang Malang Tersisa 100.000.000",
    description: "Transfer ke cabang malang untuk transaksi kedepannya",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 5,
    type: "transaction",
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 6,
    type: "transaction",
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Kemarin"
  },
  {
    id: 7,
    type: "wallet",
    title: "Uang Cabang Malang Tersisa 100.000.000",
    description: "Transfer ke cabang malang untuk transaksi kedepannya",
    time: "15.00",
    isUnread: true,
    group: "Kemarin"
  },
  {
    id: 8,
    type: "transaction",
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: false,
    group: "Kemarin"
  },
  {
    id: 9,
    type: "wallet",
    title: "Uang Cabang Malang Tersisa 100.000.000",
    description: "Transfer ke cabang malang untuk transaksi kedepannya",
    time: "15.00",
    isUnread: true,
    group: "Kemarin"
  },
  {
    id: 10,
    type: "transaction",
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: false,
    group: "Kemarin"
  }
];

export default function NotificationPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const groups = ["Hari ini", "Kemarin"];

  return (
    <div className="p-8 space-y-8">
      {/* Filter Modal */}
      <NotificationFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(data) => {
          console.log("Applying filter:", data);
          setIsFilterOpen(false);
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterOpen(true)}
            suppressHydrationWarning
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Funnel size={18} />
            Filter
          </button>
          <button 
            suppressHydrationWarning
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-900 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all"
          >
            <Checks size={18} weight="bold" />
            Tandai sudah di baca semua
          </button>
        </div>
      </div>

      {/* Notification Groups */}
      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group} className="space-y-4">
            {/* Group Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400">{group}</span>
                {group === "Hari ini" && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-md">8</span>
                )}
              </div>
              <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Checks size={16} />
                <span className="text-xs font-semibold">Tandai sudah di baca semua</span>
              </button>
            </div>

            {/* Notification List */}
            <div className="space-y-4">
              {notifications
                .filter((n) => n.group === group)
                .map((notif) => (
                  <div 
                    key={notif.id}
                    className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-start gap-5 hover:border-gray-200 transition-all cursor-pointer group"
                  >
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-900 group-hover:bg-gray-100 transition-colors">
                      {notif.type === "transaction" ? (
                        <ArrowsLeftRight size={24} weight="bold" />
                      ) : (
                        <Wallet size={24} weight="bold" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">{notif.title}</h3>
                        <span className="text-sm font-medium text-gray-400">{notif.time}</span>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">{notif.description}</p>
                    </div>
                    {notif.isUnread && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
