import React from 'react'
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import InventoryList from "@/components/dashboard/InventoryList";
import BackButton from "@/components/BackButton";

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string; }>; // ✅ Cambiar a Promise
  searchParams: Promise<any>; // ✅ También searchParams es Promise en Next.js 15
}) {
  // ✅ Await both
  const { businessId } = await params;
  const resolvedSearchParams = await searchParams;
  
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