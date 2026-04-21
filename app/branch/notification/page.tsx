"use client";

import React from "react";
import { 
  Funnel, 
  Checks, 
  ArrowsLeftRight 
} from "@phosphor-icons/react";
import NotificationFilterModal from "@/components/dashboard/NotificationFilterModal";

const notifications = [
  {
    id: 1,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 2,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 3,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 4,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 5,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: true,
    group: "Hari ini"
  },
  {
    id: 6,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: false,
    group: "Kemarin"
  },
  {
    id: 7,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: false,
    group: "Kemarin"
  },
  {
    id: 8,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: false,
    group: "Kemarin"
  },
  {
    id: 9,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: false,
    group: "Kemarin"
  },
  {
    id: 10,
    title: "Transaksi masuk",
    description: "Transaksi masuk Sebesar 100.000.000",
    time: "15.00",
    isUnread: false,
    group: "Kemarin"
  },
];

export default function NotificationPage() {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const groupedNotifications = notifications.reduce((acc, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
        <nav className="flex text-sm text-gray-500 gap-2 items-center">
          <span>Dashboard</span>
          <span className="text-gray-300 font-light">&gt;</span>
          <span className="text-gray-900 font-medium">Notifikasi</span>
        </nav>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all"
        >
          <Funnel size={20} />
          <span>Filter</span>
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all">
          <Checks size={20} />
          <span>Tandai sudah di baca semua</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-8">
        {Object.entries(groupedNotifications).map(([group, items]) => (
          <div key={group} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-500">{group}</span>
                {items.some(i => i.isUnread) && (
                  <span className="w-5 h-5 bg-red-50 flex items-center justify-center text-[10px] font-bold text-red-500 rounded-full">
                    {items.filter(i => i.isUnread).length}
                  </span>
                )}
              </div>
              <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                <Checks size={16} />
                <span>Tandai sudah di baca semua</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-gray-50 rounded-[20px] p-5 flex items-center gap-4 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                    <ArrowsLeftRight size={20} />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h3 className="font-bold text-gray-900 leading-none">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 pr-2">
                    <span className="text-xs font-medium text-gray-400">
                      {item.time}
                    </span>
                    {item.isUnread && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <NotificationFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(data) => {
          console.log("Applying filter:", data);
          setIsFilterOpen(false);
        }}
      />
    </div>
  );
}
