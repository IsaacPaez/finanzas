"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import DairyProductionForm, { DairySchema } from "./vertical-templates/DairyProductionForm";
import EggsProductionForm, { 
  EggsSchema, 
  EggsProductionData,  // ← Importar desde EggsProductionForm
  TypeProduction       // ← Importar desde EggsProductionForm
} from "./vertical-templates/EggsProductionForm";

// Definir interfaces para tipar correctamente
interface InventoryItem {
  id: string;
  name: string;
  inProduction?: boolean;
  [key: string]: unknown;
}

interface ProductionType {
  id: string; 
  name: string; 
  price: number; 
  description?: string;
}

interface TemplateConfig {
  trackIndividualProduction?: boolean;
  productionFrequency?: string;
  trackByType?: boolean;
}

interface VerticalSchema {
  unit: string;
  price: number;
  type?: string;
  inventory?: { 
    total: number; 
    items: InventoryItem[] 
  };
  templateConfig?: TemplateConfig;
  productionTypes?: ProductionType[];
}

interface Vertical {
  id: string;
  name: string;
  variables_schema: VerticalSchema;
}

interface CowProductionEntry {
  id: string;
  name: string;
  liters: number;
}

interface ProductionData {
  by_animal?: CowProductionEntry[];
  by_type?: Record<string, number>;
  total_eggs?: number;
  total_liters?: number;
  total_value?: number;
  [key: string]: unknown;
}

interface Movement {
  id: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
  vertical_id: string | null;
  vertical?: { name: string } | null;
  description?: string;
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
    description?: string;
  };
}

interface DairyProductionData {
  by_animal?: CowProductionEntry[];
  total_liters?: number;
  total_value?: number;
}

export default function MovementForm({ businessId, onComplete, movement }: MovementFormProps) {
  // Estado existente
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [date, setDate] = useState(movement?.date || new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(movement?.description || "");
  const [productionData, setProductionData] = useState<ProductionData | null>(null);
  const [qty, setQty] = useState(0);
  const [selV, setSelV] = useState(movement?.vertical_id || "");
  const [movementType, setMovementType] = useState<"ingreso" | "gasto">(movement?.type || "ingreso");
  const [manualAmount, setManualAmount] = useState<number | "">(movement?.amount || 0);
  
  // Nuevo estado para el checkbox de registro de producción
  const [recordProduction, setRecordProduction] = useState(true);

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
  const computedAmount = chosen?.variables_schema.type === "eggs" 
    ? (productionData?.total_value || 0) // Usar el valor calculado por tipo
    : pricePerUnit * qty; // Para otros tipos
  const amount = (selV && recordProduction && movementType === "ingreso") ? computedAmount : Number(manualAmount);

  // Cuando cambia el tipo de movimiento, resetear recordProduction
  useEffect(() => {
    // Si cambia a gasto, forzamos a false el recordProduction
    if (movementType === "gasto") {
      setRecordProduction(false);
    }
  }, [movementType]);

  // Función para renderizar el formulario de producción especializado
  const renderProductionForm = () => {
    if (!selV) return null;

    const selectedVertical = verticals.find((v) => v.id === selV);
    if (!selectedVertical) return null;

    const schema = selectedVertical.variables_schema;

    // Para tipo lechería
    if (schema?.type === "dairy") {
      const completeSchema: DairySchema = {
        type: "dairy",
        unit: schema.unit,
        price: schema.price,
        inventory: schema.inventory || { 
          total: 0, 
          items: [] 
        },
        templateConfig: {
          trackIndividualProduction: schema.templateConfig?.trackIndividualProduction || false,
          productionFrequency: schema.templateConfig?.productionFrequency || "daily"
        }
      };
      
      const handleDairyDataChange = (data: DairyProductionData) => {
        // Convert DairyProductionData to ProductionData
        setProductionData(data as ProductionData);
      };

      return (
        <DairyProductionForm
          schema={completeSchema}
          defaultQuantity={qty}
          onQuantityChange={setQty}
          onDataChange={handleDairyDataChange}
        />
      );
    }

    // Para tipo huevos
    if (schema?.type === "eggs") {
      const completeSchema: EggsSchema = {
        type: "eggs",
        unit: schema.unit,
        price: schema.price,
        inventory: schema.inventory || { total: 0 },
        productionTypes: schema.productionTypes || [],
        templateConfig: {
          trackByType: schema.templateConfig?.trackByType || false,
          productionFrequency: schema.templateConfig?.productionFrequency || "daily"
        }
      };

      const handleEggsDataChange = (data: EggsProductionData) => {
        // Convert EggsProductionData to ProductionData
        const converted: ProductionData = {
          ...data,
          by_type: Array.isArray(data.by_type) 
            ? Object.fromEntries(data.by_type.map((tp: TypeProduction) => [tp.id, tp.count])) 
            : data.by_type
        };
        setProductionData(converted);
      };

      return (
        <EggsProductionForm
          schema={completeSchema}
          defaultQuantity={qty}
          onQuantityChange={setQty}
          onDataChange={handleEggsDataChange}
        />
      );
    }

    // Formulario genérico para otros tipos
    return (
      <div>
        <label className="block text-sm font-medium mb-1">Cantidad</label>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(+e.target.value)}
          className="block w-full border rounded p-2"
          min="0"
          required
        />
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Crear el objeto para el movimiento (sin production_data)
      const moveData = {
        business_id: businessId,
        vertical_id: selV || null,
        date,
        type: movementType,
        amount: amount,
        description
        // Ya no incluimos production_data aquí
      };

      // 2. Guardar o actualizar el movimiento
      let movementResult;
      if (movement) {
        const { data, error } = await supabase
          .from('movements')
          .update(moveData)
          .eq('id', movement.id)
          .select()
          .single();
          
        if (error) throw error;
        movementResult = data;
      } else {
        const { data, error } = await supabase
          .from('movements')
          .insert(moveData)
          .select()
          .single();
          
        if (error) throw error;
        movementResult = data;
      }

      // 3. Si hay datos de producción y seleccionamos una vertical, actualizamos esa vertical
      if (selV && productionData && (chosen?.variables_schema.type === "dairy" || chosen?.variables_schema.type === "eggs")) {
        // Calcular total para el tipo específico
        let productionTotal = 0;
        if (chosen?.variables_schema.type === "dairy" && productionData.by_animal) {
          productionTotal = productionData.by_animal.reduce(
            (sum: number, cow: CowProductionEntry) => sum + Number(cow.liters || 0),
            0
          );
        } else if (chosen?.variables_schema.type === "eggs" && productionData.by_type) {
          productionTotal = Object.values(productionData.by_type).reduce(
            (sum: number, count: number) => sum + Number(count || 0),
            0
          );
        }

        // Obtener el schema actual
        const { data: currentVertical } = await supabase
          .from('verticals')
          .select('variables_schema')
          .eq('id', selV)
          .single();

        if (!currentVertical) throw new Error("No se encontró la vertical");

        // Crear una copia del schema actual
        const updatedSchema = { ...currentVertical.variables_schema };

        // Agregar o inicializar el historial de producción según el tipo
        if (chosen?.variables_schema.type === "dairy") {
          // Para lechería - Agregar registro al historial de vacas
          if (!updatedSchema.cowProductionHistory) {
            updatedSchema.cowProductionHistory = [];
          }

          updatedSchema.cowProductionHistory.push({
            date,
            movement_id: movementResult.id,
            total_liters: productionTotal,
            production: productionData.by_animal
          });

          // Actualizar stats por vaca si es necesario
          if (productionData.by_animal && updatedSchema.inventory && updatedSchema.inventory.items) {
            productionData.by_animal.forEach((cowProd: CowProductionEntry) => {
              const cowIndex = updatedSchema.inventory?.items.findIndex((cow: InventoryItem) => cow.id === cowProd.id);
              if (cowIndex >= 0) {
                // Podríamos actualizar estadísticas por vaca aquí si es necesario
              }
            });
          }
        } else if (chosen?.variables_schema.type === "eggs") {
          // Para huevos - Agregar registro al historial de producción
          if (!updatedSchema.eggProductionHistory) {
            updatedSchema.eggProductionHistory = [];
          }

          updatedSchema.eggProductionHistory.push({
            date,
            movement_id: movementResult.id,
            total_eggs: productionTotal,
            production: productionData.by_type
          });
        }

        // Guardar el schema actualizado
        const { error: updateError } = await supabase
          .from('verticals')
          .update({ variables_schema: updatedSchema })
          .eq('id', selV);

        if (updateError) throw updateError;
      }

      // Si llegamos aquí, el movimiento se guardó correctamente
      onComplete?.({ 
        ...movementResult, 
        vertical: selV ? { name: chosen?.name } : null 
      });
      
    } catch (error) {
      console.error("Error al guardar el movimiento:", error);
      // Usar type guard para acceder a la propiedad message de manera segura
      if (error instanceof Error) {
        alert(`Error al guardar el movimiento: ${error.message}`);
      } else {
        alert("Error desconocido al guardar el movimiento");
      }
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

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del movimiento"
          className="block w-full border rounded p-2 h-24 resize-none"
        />
      </div>

      {/* Select Vertical - Solo mostrar para ingresos */}
      {movementType === "ingreso" && (
        <div>
          <label className="block text-sm font-medium mb-1">Vertical</label>
          <select
            value={selV}
            onChange={(e) => setSelV(e.target.value)}
            className="block w-full border rounded p-2"
          >
            <option value="">— Ingreso manual —</option>
            {verticals.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Checkbox para registrar producción - Solo mostrar si es ingreso Y hay vertical seleccionada */}
      {movementType === "ingreso" && selV && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="record-production"
            checked={recordProduction}
            onChange={(e) => setRecordProduction(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="record-production" className="ml-2 text-sm">
            Registrar producción
          </label>
        </div>
      )}

      {/* Si hay vertical Y es ingreso Y checkbox activado => mostrar form de producción */}
      {selV && movementType === "ingreso" && recordProduction && renderProductionForm()}

      {/* En cualquier otro caso => monto manual */}
      {(!selV || !recordProduction || movementType === "gasto") && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {movementType === "ingreso" ? "Monto del ingreso" : "Monto del gasto"}
          </label>
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