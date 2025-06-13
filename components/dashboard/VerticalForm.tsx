"use client";
import React, { useEffect, useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export type Template = {
  id: string;
  name: string;
  variables_schema: { unit: string; estimated: number; price: number };
};

interface FormProps {
  businessId: string;
  templates: Template[];
  onCreated?: () => void;
}

export default function VerticalForm({
  businessId,
  templates,
  onCreated,
}: FormProps) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [estimated, setEstimated] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Al cambiar plantilla, auto-rellena campos
  useEffect(() => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setName(tpl.name);
      setUnit(tpl.variables_schema.unit);
      setEstimated(tpl.variables_schema.estimated);
      setPrice(tpl.variables_schema.price);
    } else {
      setName("");
      setUnit("");
      setEstimated(0);
      setPrice(0);
    }
  }, [templateId, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("verticals").insert([
      {
        business_id: businessId,
        name,
        is_template: false,
        variables_schema: { unit, estimated, price },
        active: true,
      },
    ]);
    if (!error) {
      router.refresh();
      onCreated?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
      <select
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        className="block w-full border rounded p-2"
      >
        <option value="">— Elige una plantilla —</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full border rounded p-2"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Unidad</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="block w-full border rounded p-2"
            placeholder="litros, kg…"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Estimado</label>
          <input
            type="number"
            value={estimated}
            onChange={(e) => setEstimated(+e.target.value)}
            className="block w-full border rounded p-2"
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Precio x unidad</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
            className="block w-full border rounded p-2"
            min={0}
            step="0.01"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        {loading ? "Guardando…" : "+ Nueva Vertical"}
      </button>
    </form>
  );
}

// Fetch templates (this code should be placed where you fetch data, e.g., in a useEffect or getServerSideProps)
// const { data: templates } = await supabase
//   .from("verticals")
//   .select("*")
//   .eq("is_template", true);