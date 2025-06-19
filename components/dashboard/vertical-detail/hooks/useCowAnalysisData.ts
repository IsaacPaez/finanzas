import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DairyTemplateConfig } from "../types/interfaces";

interface ProductionRecord {
  date: string;
  liters: number;
  movement_id?: string;
}

interface CowData {
  id: string;
  name: string;
  production_average?: number;
  last_production?: number;
  trend?: string;
  status?: string;
  comments?: string;
}

// Interfaces para tipado de datos de producción
interface CowProductionData {
  id: string;
  name: string;
  liters: number;
}

interface CowProductionHistoryRecord {
  date: string;
  total_liters: number;
  production: CowProductionData[];
  movement_id?: string;
}

interface CowInventoryItem {
  id: string;
  name: string;
  notes?: string;
  comments?: string;
  inProduction?: boolean;
}

interface DairySchema {
  type: 'dairy';
  price: number;
  unit: string;
  templateConfig: DairyTemplateConfig; // ✅ Usar interface tipada en lugar de any
  inventory?: {
    items: CowInventoryItem[];
  };
  cowProductionHistory?: CowProductionHistoryRecord[];
}

export const useCowAnalysisData = (
  isOpen: boolean,
  cow: CowData,
  verticalId: string,
  onUpdateCow: (cowId: string, updates: Partial<CowData>) => void
) => {
  const [productionHistory, setProductionHistory] = useState<ProductionRecord[]>([]);
  const [comments, setComments] = useState(cow.comments || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Usar useCallback para evitar warning de dependencias
  const loadProductionHistory = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data: vertical } = await supabase
        .from('verticals')
        .select('variables_schema')
        .eq('id', verticalId)
        .single();

      if (vertical?.variables_schema?.cowProductionHistory) {
        const cowProduction: ProductionRecord[] = [];
        const schema = vertical.variables_schema as DairySchema;
        
        // ✅ Tipado correcto sin any
        schema.cowProductionHistory?.forEach((record: CowProductionHistoryRecord) => {
          if (record.production && Array.isArray(record.production)) {
            const cowRecord = record.production.find((p: CowProductionData) => p.id === cow.id);
            if (cowRecord && cowRecord.liters > 0) {
              cowProduction.push({
                date: record.date,
                liters: cowRecord.liters || 0,
                movement_id: record.movement_id
              });
            }
          }
        });

        cowProduction.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setProductionHistory(cowProduction);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  }, [cow.id, verticalId]); // ✅ Incluir dependencias necesarias

  // Cargar historial de producción cuando se abre el modal
  useEffect(() => {
    if (isOpen && cow.id) {
      loadProductionHistory();
      setComments(cow.comments || "");
    }
  }, [isOpen, cow.id, cow.comments, loadProductionHistory]); // ✅ Incluir loadProductionHistory

  const saveComments = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      const { data: vertical } = await supabase
        .from('verticals')
        .select('variables_schema')
        .eq('id', verticalId)
        .single();

      if (vertical) {
        const updatedSchema = { ...vertical.variables_schema } as DairySchema;
        
         // ✅ Tipado correcto sin any
        if (updatedSchema.inventory && updatedSchema.inventory.items) {
          const cowIndex = updatedSchema.inventory.items.findIndex((item: CowInventoryItem) => item.id === cow.id);
          if (cowIndex >= 0) {
            updatedSchema.inventory.items[cowIndex].comments = comments;
          }
        }

        const { error } = await supabase
          .from('verticals')
          .update({ variables_schema: updatedSchema })
          .eq('id', verticalId);

        if (error) throw error;

        onUpdateCow(cow.id, { comments });
        alert("Comentarios guardados exitosamente");
      }
    } catch (error) {
      console.error("Error guardando comentarios:", error);
      alert("Error al guardar comentarios");
    } finally {
      setSaving(false);
    }
  };

  return {
    productionHistory,
    comments,
    setComments,
    loading,
    saving,
    saveComments
  };
};