import { createClient } from "@/lib/supabase/server";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Obtener negocios del usuario
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id);

  return <DashboardPanel businesses={businesses || []} />;
}