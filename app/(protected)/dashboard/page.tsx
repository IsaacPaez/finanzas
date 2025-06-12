import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // redirect("/auth/login") si lo deseas
    return null;
  }

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id);

  return (
    <DashboardLayout>
      <DashboardPanel businesses={businesses ?? []} />
    </DashboardLayout>
  );
}