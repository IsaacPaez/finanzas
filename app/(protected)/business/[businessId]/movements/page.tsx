"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export default function MovementsPage() {
  const { businessId } = useParams();
  const router = useRouter();

  const [verticals, setVerticals] = useState<
    { id: string; name: string; variables_schema: { unit: string; price: number } }[]
  >([]);
  const [selV, setSelV] = useState("");
  const [qty, setQty] = useState(0);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [movementType, setMovementType] = useState<'ingreso'|'gasto'>('ingreso');
  const [manualAmount, setManualAmount] = useState<number | ''>('');

  // Carga verticales activas
  useEffect(() => {
    async function load() {
      if (!businessId) return;
      const supa = createBrowserClient();
      const { data } = await supa
        .from("verticals")
        .select("id, name, variables_schema")
        .eq("business_id", businessId)
        .eq("active", true);
      setVerticals(data || []);
    }
    load();
  }, [businessId]);

  const chosen = verticals.find((v) => v.id === selV);
  const pricePerUnit = chosen?.variables_schema.price ?? 0;
  const qtyAmount = qty;
  const computedAmount = pricePerUnit * qtyAmount;
  const amount = selV ? computedAmount : Number(manualAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supa = createBrowserClient();

    const newMove = {
      business_id: businessId,
      vertical_id: selV || null,
      date,
      type: movementType,
      amount,
    };

    const { error } = await supa
      .from("movements")
      .insert([newMove]);
    setLoading(false);
    if (error) { console.error(error); return; }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {/* 1) Selector de tipo ingreso/gasto */}
      <select
        value={movementType}
        onChange={(e) => setMovementType(e.target.value as 'ingreso'|'gasto')}
        className="block w-full border rounded p-2"
      >
        <option value="ingreso">Ingreso</option>
        <option value="gasto">Gasto</option>
      </select>

      {/* 2) Select Vertical */}
      <select
        value={selV}
        onChange={(e) => setSelV(e.target.value)}
        className="block w-full border rounded p-2"
      >
        <option value="">— Movimiento manual —</option>
        {verticals.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      {/* 3a) Si hay vertical => cantidad */}
      {selV && (
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(+e.target.value)}
          placeholder="Cantidad"
          className="block w-full border rounded p-2"
          required
        />
      )}

      {/* 3b) Si NO hay vertical => monto manual */}
      {!selV && (
        <input
          type="number"
          min={0}
          step="0.01"
          value={manualAmount}
          onChange={(e) => setManualAmount(e.target.value === '' ? '' : +e.target.value)}
          placeholder="Monto"
          className="block w-full border rounded p-2"
          required
        />
      )}

      {/* 4) Mostrar total */}
      <div className="text-lg">
        Total: <strong>${amount.toFixed(2)}</strong>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Guardando…" : "+ Agregar movimiento"}
      </button>
    </form>
  );
}