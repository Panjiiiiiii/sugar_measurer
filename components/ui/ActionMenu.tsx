"use client";

import React, { useState, useEffect, useRef } from "react";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  icon?: React.ReactNode;
}

interface ActionMenuProps {
  trigger?: React.ReactNode;
  items: ActionMenuItem[];
  align?: "left" | "right";
  // Controlled props (optional)
  isOpen?: boolean;
  onClose?: () => void;
}

export function ActionMenu({ 
  trigger, 
  items, 
  align = "right",
  isOpen: controlledIsOpen,
  onClose: controlledOnClose 
}: ActionMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const onClose = controlledOnClose || (() => setInternalIsOpen(false));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {trigger && (
        <div onClick={() => setInternalIsOpen(!internalIsOpen)}>
          {trigger}
        </div>
      )}

      {isOpen && (
        <div 
          className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-${align}`}
        >
          {items.map((item, index) => (
            <button 
              key={index}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className={`w-full px-5 py-3 text-left text-[13px] font-bold transition-colors flex items-center gap-3 ${
                item.variant === "danger" 
                  ? "text-red-500 hover:bg-red-50" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
