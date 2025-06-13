import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import VerticalsList from "@/components/dashboard/VerticalsList";
import BackButton from "@/components/BackButton";

export default async function VerticalPage({
  params,
}: {
  params: { businessId: string };
}) {
  const supabase = await createClient();
  const { data: verticals } = await supabase
    .from("verticals")
    .select("*")
    .eq("business_id", params.businessId);

  const { data: templates } = await supabase
    .from("verticals")
    .select("*")
    .eq("is_template", true);

  return (
    <DashboardLayout>
      <BackButton />
      <h1 className="text-2xl font-semibold mb-4">Verticales de Negocio</h1>
      <VerticalsList
        verticals={verticals ?? []}
        templates={templates ?? []}
        businessId={params.businessId}
      />
    </DashboardLayout>
  );
}