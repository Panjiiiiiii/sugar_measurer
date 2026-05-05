import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({ 
  variant = "primary", 
  size = "md", 
  children, 
  className = "", 
  icon,
  iconPosition = "left",
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all shadow-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#10B981] text-white hover:bg-[#0E9F6E]",
    secondary: "bg-[#00A3FF] text-white hover:bg-[#008EDB]",
    white: "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-gray-400 hover:text-gray-900 shadow-none border-none",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
    xl: "px-6 py-4 text-sm",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" && <span>{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span>{icon}</span>}
    </button>
  );
}
