import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import VerticalDetail from "@/components/dashboard/VerticalDetail";
import Link from "next/link";

export default async function VerticalDetailPage({
  params,
}: {
  params: Promise<{ businessId: string; verticalId: string }> // ✅ Cambiar a Promise
}) {
  // ✅ Await the params
  const { businessId, verticalId } = await params;

  const supabase = await createClient();
  const { data: vertical } = await supabase
    .from("verticals")
    .select("*")
    .eq("id", verticalId)
    .single();

  const { data: movements } = await supabase
    .from("movements")
    .select("*")
    .eq("vertical_id", verticalId)
    .order("date", { ascending: false })
    .limit(100);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link
          href={`/business/${businessId}/verticals`}
          className="text-blue-600 hover:underline mb-2 inline-block"
        >
          &larr; Volver a verticales
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {vertical?.name || "Detalle de Vertical"}
        </h1>
      </div>
      <VerticalDetail
        vertical={vertical}
        movements={movements || []}
      />
    </DashboardLayout>
  );
}