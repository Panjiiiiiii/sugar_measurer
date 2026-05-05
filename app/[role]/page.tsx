import { redirect } from "next/navigation";

export default function RoleRedirectPage({ params }: { params: { role: string } }) {
  const { role } = params;
  redirect(`/${role}/timbangan`);
}
