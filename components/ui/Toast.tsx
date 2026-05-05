import React from "react";
import { CheckCircle, XCircle, Info, Warning } from "@phosphor-icons/react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose?: () => void;
}

export function Toast({ message, type = "success", isVisible, onClose }: ToastProps) {
  if (!isVisible) return null;

  const styles = {
    success: "bg-[#009262] text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-orange-500 text-white",
  };

  const icons = {
    success: <CheckCircle size={24} weight="fill" />,
    error: <XCircle size={24} weight="fill" />,
    info: <Info size={24} weight="fill" />,
    warning: <Warning size={24} weight="fill" />,
  };

  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`${styles[type]} px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3`}>
        {icons[type]}
        <span className="font-bold">{message}</span>
      </div>
    </div>
  );
}
