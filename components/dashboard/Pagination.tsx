"use client";

import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export default function Pagination() {
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <span className="text-sm text-gray-500 font-medium">
        20 data show from 100 data
      </span>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <CaretLeft size={16} weight="bold" />
          Previous
        </button>
        
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-900 font-bold border border-gray-100">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors">
            3
          </button>
          <span className="text-gray-300 px-1">...</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors">
            55
          </button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          Next
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
