"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { 
  Plus, 
  Funnel, 
  DotsThreeVertical,
  X,
  CaretDown
} from "@phosphor-icons/react";
import { Toast, DeleteModal } from "@/components/ui";
import axios from "@/lib/axios";

interface UserItem {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "operator" | "finance" |  "manager";
  location?: {
    id: string;
    name: string;
  };
}


function mapRoleLabel(role: string) {
  if (role === "operator") return "Admin Cabang";
  if (role === "finance") return "Admin Finance";
  if (role === "manager") return "Manager";
  return role;
}

export default function DataUserPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const roleRaw = params.role as string;
  const role = !roleRaw || roleRaw === "undefined" ? "manager" : roleRaw;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);
  
  // Filter States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("all");
  
  const [tempRoleFilter, setTempRoleFilter] = useState("all");
  const [tempLocationFilter, setTempLocationFilter] = useState("all");
  
  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`/api/user/${userToDelete.id}`);

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);

      setToastType("success");
      setToastMessage("Data User Berhasil Dihapus");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Failed to delete user:", error);
      setToastType("error");
      setToastMessage("Gagal menghapus data user");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      throw error;
    }
  };

  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeRowMenu !== null && tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setActiveRowMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeRowMenu]);

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/user", {
          params: { page: 1, limit: 100 }
        });
        
        if (!isMounted) return;

        const apiUsers = response.data?.data ?? [];
        
        setUsers(apiUsers);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch users from database:", error);
        setUsers([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Frontend filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesRole = selectedRoleFilter === "all" || user.role === selectedRoleFilter;
    const matchesLocation = selectedLocationFilter === "all" || 
      (user.location?.name && user.location.name.toLowerCase() === selectedLocationFilter.toLowerCase());
    return matchesRole && matchesLocation;
  });

  const handleApplyFilter = () => {
    setSelectedRoleFilter(tempRoleFilter);
    setSelectedLocationFilter(tempLocationFilter);
    setIsFilterModalOpen(false);
    
    setToastType("success");
    setToastMessage("Filter berhasil diterapkan");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="space-y-8">
      <Toast 
        isVisible={showToast} 
        message={toastMessage} 
        type={toastType} 
      />

      {/* Page Title & Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#111827]">Data User</h1>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Button */}
          <button
            suppressHydrationWarning
            onClick={() => {
              setTempRoleFilter(selectedRoleFilter);
              setTempLocationFilter(selectedLocationFilter);
              setIsFilterModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-all cursor-pointer shadow-sm animate-in fade-in"
          >
            <Funnel size={16} weight="bold" />
            <span>Filter</span>
          </button>

          {/* Add Button */}
          <button
            suppressHydrationWarning
            onClick={() => router.push(`/${role}/user/add`)}
            className="flex items-center gap-2 px-5 py-2 bg-[#0095FF] text-white rounded-xl text-sm font-bold hover:bg-[#0084FF] transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Table Card Wrapper */}
      <section className="bg-white border border-[#F3F4F6] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6">
          <h2 className="text-base font-bold text-[#111827]">Data User</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" ref={tableRef}>
            <thead>
              <tr className="border-y border-[#F3F4F6] bg-[#F9FAFB]/50">
                <th className="px-8 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Username</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Email</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Role</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Location</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-sm font-semibold text-gray-400">
                    Memuat data user...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                    {/* Username */}
                    <td className="px-8 py-5 text-sm font-semibold text-[#4B5563]">{row.name}</td>
                    
                    {/* Email */}
                    <td className="px-8 py-5 text-sm font-semibold text-[#4B5563]">{row.email}</td>
                    
                    {/* Role */}
                    <td className="px-8 py-5 text-sm font-semibold text-[#4B5563]">
                      {mapRoleLabel(row.role)}
                    </td>
                    
                    {/* Location */}
                    <td className="px-8 py-5 text-sm font-semibold text-[#4B5563]">
                      {row.location?.name || "Malang"}
                    </td>
                    
                    {/* Action Button */}
                    <td className="px-8 py-5 flex justify-center">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRowMenu(activeRowMenu === row.id ? null : row.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors border border-[#E5E7EB] cursor-pointer flex items-center justify-center bg-white shadow-sm"
                        >
                          <DotsThreeVertical size={18} weight="bold" />
                        </button>

                        {activeRowMenu === row.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border border-[#F3F4F6] rounded-xl shadow-lg py-1 z-40 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                            <button
                              onClick={() => {
                                router.push(`/${role}/user/edit/${row.id}`);
                                setActiveRowMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <div className="border-t border-[#F3F4F6]" />
                            <button
                              onClick={() => {
                                setUserToDelete(row);
                                setIsDeleteModalOpen(true);
                                setActiveRowMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-sm font-semibold text-gray-400">
                    Tidak ada data user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Filter Modal Overlay matching Image 3 */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[1.5px] z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 space-y-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-center relative">
              <h2 className="text-xl font-bold text-gray-900 select-none">Filter</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Role Select */}
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-gray-900 block ml-1 select-none">Role</label>
                <div className="relative w-full">
                  <select
                    value={tempRoleFilter}
                    onChange={(e) => setTempRoleFilter(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-bold text-gray-900 appearance-none cursor-pointer pr-12"
                  >
                    <option value="all">Semua Role</option>
                    <option value="operator">Admin Cabang</option>
                    <option value="finance">Admin Finance</option>
                    <option value="manager">Manager</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <CaretDown size={16} weight="bold" />
                  </div>
                </div>
              </div>

              {/* Cabang Select */}
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-gray-900 block ml-1 select-none">Cabang</label>
                <div className="relative w-full">
                  <select
                    value={tempLocationFilter}
                    onChange={(e) => setTempLocationFilter(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-bold text-gray-900 appearance-none cursor-pointer pr-12"
                  >
                    <option value="all">Semua Cabang</option>
                    <option value="Malang">Malang</option>
                    <option value="Blitar">Blitar</option>
                    <option value="Kediri">Kediri</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <CaretDown size={16} weight="bold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2">
              <button
                onClick={handleApplyFilter}
                className="w-full py-4.5 bg-[#009B4C] hover:bg-[#008741] text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/30 active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Apakah anda yakin ingin menghapus data user ini?"
      />
    </div>
  );
}