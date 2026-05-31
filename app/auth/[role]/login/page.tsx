"use client";

import React from "react";
import { useParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function DynamicLoginPage() {
  const params = useParams();
  const roleRaw = params.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "branch" : roleRaw;

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] flex items-center justify-center py-12">
      <LoginForm initialRole={role} />
    </div>
  );
}
