"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Funnel,
  Checks,
  ArrowsLeftRight,
  Wallet,
  Trash,
} from "@phosphor-icons/react";
import axios from "axios";
import NotificationFilterModal from "@/components/dashboard/NotificationFilterModal";

interface NotifItem {
  id: string;
  type: "transaction" | "wallet" | string;
  title: string;
  description: string;
  time: string;
  is_read: boolean;
  group: string;
  created_at: string;
}

function getGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "Hari ini";
  if (d.getTime() === yesterday.getTime()) return "Kemarin";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
}

function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
    hour12: false,
  }).format(new Date(dateStr));
}

export default function NotificationPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{
    start_date: string;
    end_date: string;
    is_read: string;
  }>({ start_date: "", end_date: "", is_read: "" });

  // Ambil user_id dari x-user-id header via auth/me
  useEffect(() => {
    axios
      .get<{ data?: { id?: string } }>("/api/auth/me")
      .then((res) => setUserId(res.data?.data?.id || ""))
      .catch(() => {});
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = { user_id: userId };
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.is_read !== "") params.is_read = filters.is_read;

      const res = await axios.get<{ data: any[] }>("/api/notification", { params });
      const raw = res.data?.data ?? [];

      setNotifications(
        raw.map((n) => ({
          id: n.id,
          type: n.type ?? "transaction",
          title: n.title,
          description: n.message ?? n.description ?? "",
          time: formatTime(n.created_at),
          is_read: n.is_read,
          group: getGroup(n.created_at),
          created_at: n.created_at,
        }))
      );
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Tandai semua sudah dibaca (opsional: per grup dengan date)
  const markAllRead = async (groupDate?: string) => {
    if (!userId) return;
    try {
      await axios.put("/api/notification", {
        user_id: userId,
        ...(groupDate ? { date: groupDate } : {}),
      });
      setNotifications((prev) =>
        prev.map((n) => {
          if (!groupDate) return { ...n, is_read: true };
          return n.group === getGroup(groupDate) ? { ...n, is_read: true } : n;
        })
      );
    } catch (e) {
      console.error("Failed to mark all read:", e);
    }
  };

  // Hapus semua (opsional: per grup)
  const deleteAll = async (groupDate?: string) => {
    if (!userId) return;
    try {
      await axios.delete("/api/notification", {
        data: {
          user_id: userId,
          ...(groupDate ? { date: groupDate } : {}),
        },
      });
      if (!groupDate) {
        setNotifications([]);
      } else {
        setNotifications((prev) =>
          prev.filter((n) => n.group !== getGroup(groupDate))
        );
      }
    } catch (e) {
      console.error("Failed to delete notifications:", e);
    }
  };

  const groups = Array.from(new Set(notifications.map((n) => n.group)));

  const unreadCount = (group: string) =>
    notifications.filter((n) => n.group === group && !n.is_read).length;

  return (
    <div className="p-8 space-y-8">
      <NotificationFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(data) => {
          setFilters({
            start_date: data.startDate,
            end_date: data.endDate,
            is_read: data.is_read,
          });
          setIsFilterOpen(false);
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Funnel size={18} />
            Filter
          </button>
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-900 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all"
          >
            <Checks size={18} weight="bold" />
            Tandai sudah di baca semua
          </button>
          <button
            onClick={() => deleteAll()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Trash size={20} weight="bold" className="text-gray-900" />
            Hapus semua notifikasi
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm font-medium">
          Memuat notifikasi...
        </div>
      ) : groups.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm font-medium">
          Tidak ada notifikasi
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const groupDate = notifications.find((n) => n.group === group)?.created_at;
            const count = unreadCount(group);

            return (
              <div key={group} className="space-y-4">
                {/* Group Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400">{group}</span>
                    {count > 0 && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-md">
                        {count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.group === group)
                    .map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) {
                            axios.put("/api/notification", {
                              user_id: userId,
                              date: notif.created_at,
                            });
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notif.id ? { ...n, is_read: true } : n
                              )
                            );
                          }
                        }}
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
                            <h3 className="text-base font-bold text-gray-900">
                              {notif.title}
                            </h3>
                            <span className="text-sm font-medium text-gray-400">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 font-medium">
                            {notif.description}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}