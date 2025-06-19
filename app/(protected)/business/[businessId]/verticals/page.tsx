import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import VerticalsList from "@/components/dashboard/VerticalsList";
import Link from "next/link";

export default async function VerticalsPage({
  params,
}: {
  params: Promise<{ businessId: string; }> // ✅ Cambiar a Promise
}) {
  // ✅ Await the params
  const { businessId } = await params;
  
  const supabase = await createClient();
  
  // Obtener verticales activas del negocio
  const { data: verticals } = await supabase
    .from("verticals")
    .select("*")
    .eq("business_id", businessId)
    .eq("active", true)
    .order("created_at", { ascending: false });
  
  // Obtener plantillas de verticales
  const { data: templates } = await supabase
    .from("verticals")
    .select("*")
    .eq("is_template", true)
    .order("name", { ascending: true });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Reemplazar BackButton con un Link explícito */}
          <Link 
            href={`/business/${businessId}`}
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            &larr; Volver al negocio
          </Link>
          <h1 className="text-2xl font-bold mt-2">Verticales Activos</h1>
          <p className="text-gray-500">
            Administra las líneas de negocio de tu empresa
          </p>
        </div>
      </div>
      
      <VerticalsList 
        verticals={verticals || []} 
        templates={templates || []} 
        businessId={businessId}
      />
    </DashboardLayout>
  );
}
