import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showInfo?: boolean;
  totalData?: number;
  showingData?: number;
}

export function Pagination({ 
  currentPage = 1, 
  totalPages = 5, 
  onPageChange,
  showInfo = true,
  totalData = 100,
  showingData = 20
}: PaginationProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {showInfo && (
        <span className="text-xs font-medium text-gray-400">
          {showingData} data show from {totalData} data
        </span>
      )}
      <div className="flex items-center gap-2">
        <Button 
          variant="white" 
          size="sm" 
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          icon={<CaretLeft size={16} weight="bold" />}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            // Simple logic for brevity, can be expanded for large page counts
            if (page === currentPage) {
              return (
                <button 
                  key={page}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-[#00A3FF] font-bold border border-blue-100"
                >
                  {page}
                </button>
              );
            }
            return (
              <button 
                key={page}
                onClick={() => onPageChange?.(page)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 font-bold hover:bg-blue-50 hover:text-[#00A3FF] transition-colors"
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button 
          variant="white" 
          size="sm" 
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon={<CaretRight size={16} weight="bold" />}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
