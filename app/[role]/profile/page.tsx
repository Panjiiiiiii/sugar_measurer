"use client";

import { useParams } from "next/navigation";
import ProfilePage from "@/components/dashboard/ProfilePage";

export default function DynamicProfilePage() {
  const params = useParams();
  const roleParam = params.role;
  const role = Array.isArray(roleParam) ? roleParam[0] : roleParam;

  return <ProfilePage initialRole={role || "branch"} />;
}
