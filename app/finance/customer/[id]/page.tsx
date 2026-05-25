"use client";

import React from "react";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 capitalize">
        Detail Customer {id}
      </h1>
      <p className="text-gray-500 mt-2">
        Halaman ini akan menampilkan detail informasi untuk customer ID: {id}.
      </p>
      
      <div className="mt-8 p-12 bg-white border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
           <span className="text-2xl">👤</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Customer Detail View</h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          Fitur untuk melihat profil lengkap dan riwayat transaksi customer sedang dikembangkan.
        </p>
      </div>
    </div>
  );
}
