import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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

  // Cargar historial de producción cuando se abre el modal
  useEffect(() => {
    if (isOpen && cow.id) {
      loadProductionHistory();
      setComments(cow.comments || "");
    }
  }, [isOpen, cow.id, cow.comments]);

  const loadProductionHistory = async () => {
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
        
        vertical.variables_schema.cowProductionHistory.forEach((record: any) => {
          if (record.production && Array.isArray(record.production)) {
            const cowRecord = record.production.find((p: any) => p.id === cow.id);
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
  };

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
        const updatedSchema = { ...vertical.variables_schema };
        
        if (updatedSchema.inventory && updatedSchema.inventory.items) {
          const cowIndex = updatedSchema.inventory.items.findIndex((item: any) => item.id === cow.id);
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