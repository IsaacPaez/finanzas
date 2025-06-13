import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import VerticalsList from "@/components/dashboard/VerticalsList";
import BackButton from "@/components/BackButton";

export default async function VerticalPage({
  params,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchParams,   // Next exige esta prop aunque no la uses
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;  // Usar any aquí satisface el sistema de tipos interno de Next.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any;  // También needed como any para satisfacer PageProps
}) {
  const businessId = params.businessId as string;
  
  const supabase = await createClient();
  const { data: verticals } = await supabase
    .from("verticals")
    .select("*")
    .eq("business_id", businessId);

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
        businessId={businessId}
      />
    </DashboardLayout>
  );
}
