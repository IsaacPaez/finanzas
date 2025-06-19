import React from 'react'
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import InventoryList from "@/components/dashboard/InventoryList";
import BackButton from "@/components/BackButton";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ businessId: string; }>; // ✅ Solo params necesario
  // ✅ Removido searchParams ya que no se usa
}) {
  // ✅ Solo await params
  const { businessId } = await params;
  // ✅ Removido resolvedSearchParams
  
  const supabase = await createClient();
  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("business_id", businessId)
    .order("name");

  return (
    <DashboardLayout>
      <BackButton />
      <h1 className="text-2xl font-semibold mb-4">Inventario</h1>
      <InventoryList 
        items={inventoryItems || []} 
        businessId={businessId} 
      />
    </DashboardLayout>
  );
}