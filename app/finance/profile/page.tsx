import ProfilePage from "@/components/dashboard/ProfilePage";

export default function FinanceProfilePage() {
  return (
    <div className="p-8">
      <ProfilePage forcedRole="finance" />
    </div>
  );
}
