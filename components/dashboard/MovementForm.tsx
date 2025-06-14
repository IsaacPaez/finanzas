"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Movement {
  id: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
  vertical_id: string | null;
  vertical?: { name: string } | null;
  description?: string; // Agregamos descripción
}

interface MovementFormProps {
  businessId: string;
  onComplete?: (newMovement?: Movement) => void;
  movement?: {
    id: string;
    date: string;
    type: "ingreso" | "gasto";
    amount: number;
    vertical_id: string | null;
    description?: string; // Agregamos descripción
  };
}

export default function MovementForm({ businessId, onComplete, movement }: MovementFormProps) {
  // Estado existente
  const [verticals, setVerticals] = useState<
    { id: string; name: string; variables_schema: { unit: string; price: number } }[]
  >([]);
  const [movementType, setMovementType] = useState<"ingreso" | "gasto">(movement?.type || "ingreso");
  const [selV, setSelV] = useState(movement?.vertical_id || "");
  const [qty, setQty] = useState(0);
  const [manualAmount, setManualAmount] = useState<number | "">(movement?.amount || "");
  const [date, setDate] = useState(movement?.date || new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  // Nuevo estado para descripción
  const [description, setDescription] = useState(movement?.description || "");

  // Carga verticals activas
  useEffect(() => {
    async function load() {
      if (!businessId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("verticals")
        .select("id, name, variables_schema")
        .eq("business_id", businessId)
        .eq("active", true);
      setVerticals(data || []);

      // Si estamos editando y hay vertical_id, calculamos la cantidad
      if (movement?.vertical_id && data) {
        const vertical = data.find((v) => v.id === movement.vertical_id);
        if (vertical && vertical.variables_schema.price) {
          setQty(movement.amount / vertical.variables_schema.price);
        }
      }
    }
    load();
  }, [businessId, movement]);

  // Calcular monto basado en vertical seleccionada o monto manual
  const chosen = verticals.find((v) => v.id === selV);
  const pricePerUnit = chosen?.variables_schema.price ?? 0;
  const computedAmount = pricePerUnit * qty;
  const amount = selV ? computedAmount : Number(manualAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const moveData = {
      business_id: businessId,
      vertical_id: selV || null,
      date,
      type: movementType,
      amount,
      description, // Agregamos descripción al objeto de datos
    };

    try {
      if (movement) {
        // Actualizar movimiento existente
        const { data, error } = await supabase
          .from("movements")
          .update(moveData)
          .eq("id", movement.id)
          .select()
          .single();

        if (error) throw error;

        // Pasar el movimiento actualizado al callback
        onComplete?.({ ...data, vertical: selV ? { name: chosen?.name } : null });
      } else {
        // Crear nuevo movimiento
        const { data, error } = await supabase
          .from("movements")
          .insert([moveData])
          .select()
          .single();

        if (error) throw error;

        // Pasar el nuevo movimiento al callback
        onComplete?.({ ...data, vertical: selV ? { name: chosen?.name } : null });
      }
    } catch (error) {
      console.error("Error guardando movimiento:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de fecha */}
      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="block w-full border rounded p-2"
          required
        />
      </div>

      {/* Selector de tipo ingreso/gasto */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as "ingreso" | "gasto")}
          className="block w-full border rounded p-2"
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
      </div>

      {/* NUEVO CAMPO: Descripción */}
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del movimiento"
          className="block w-full border rounded p-2 h-24 resize-none"
        />
      </div>

      {/* Select Vertical */}
      <div>
        <label className="block text-sm font-medium mb-1">Vertical</label>
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
      </div>

      {/* Si hay vertical => cantidad */}
      {selV && (
        <div>
          <label className="block text-sm font-medium mb-1">Cantidad</label>
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(+e.target.value)}
            placeholder="Cantidad"
            className="block w-full border rounded p-2"
            required
          />
        </div>
      )}

      {/* Si NO hay vertical => monto manual */}
      {!selV && (
        <div>
          <label className="block text-sm font-medium mb-1">Monto</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value === "" ? "" : +e.target.value)}
            placeholder="Monto"
            className="block w-full border rounded p-2"
            required
          />
        </div>
      )}

      {/* Mostrar total */}
      <div className="text-lg">
        Total: <strong>${amount.toFixed(2)}</strong>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Guardando…" : movement ? "Actualizar movimiento" : "+ Agregar movimiento"}
      </button>
    </form>
  );
}