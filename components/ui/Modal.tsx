import React from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  centerTitle?: boolean;
}

export function Modal({ isOpen, onClose, title, children, footer, size = "md", centerTitle }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} relative z-10 overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className="px-8 py-6 border-b border-gray-50 flex items-center relative">
          <h3 className={`text-xl font-bold text-gray-900 ${centerTitle ? "w-full text-center" : ""}`}>
            {title}
          </h3>
          <button 
            onClick={onClose}
            className={`${centerTitle ? "absolute right-6" : ""} p-2 text-gray-400 hover:text-gray-900 transition-colors`}
          >
            <X size={20} weight="bold" />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
        {footer && (
          <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-end gap-3 bg-gray-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
