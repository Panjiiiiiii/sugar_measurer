import { redirect } from "next/navigation";

export default async function RoleRedirectPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  redirect(`/${role}/timbangan`);
}
