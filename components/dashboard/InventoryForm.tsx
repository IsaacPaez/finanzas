"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { InventoryItem } from "./InventoryList";

interface FormProps {
  businessId: string;
  item?: InventoryItem;
  onComplete: () => void;
}

export default function InventoryForm({ businessId, item, onComplete }: FormProps) {
  const [name, setName] = useState(item?.name || "");
  const [quantity, setQuantity] = useState(item?.quantity || 0);
  const [unit, setUnit] = useState(item?.unit || "");
  const [comments, setComments] = useState(item?.comments || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const supabase = createClient();
    
    if (item) {
      // Actualizar item existente
      await supabase
        .from("inventory_items")
        .update({
          name,
          quantity,
          unit,
          comments: comments || null,
        })
        .eq("id", item.id);
    } else {
      // Crear nuevo item
      await supabase
        .from("inventory_items")
        .insert([{
          business_id: businessId,
          name,
          quantity,
          unit,
          comments: comments || null,
        }]);
    }
    
    setLoading(false);
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-md p-2"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cantidad</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border rounded-md p-2"
            min={0}
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Unidad</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border rounded-md p-2"
            placeholder="kg, litros, unidades..."
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Comentarios (opcional)</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full border rounded-md p-2"
          rows={3}
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Guardando..." : item ? "Actualizar" : "Agregar"}
      </button>
    </form>
  );
}