"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export interface DairySchema {
  type: "dairy";
  unit: string;
  price: number;
  inventory: {
    total: number;
    items: DairyCow[];
  };
  templateConfig: {
    trackIndividualProduction: boolean;
    productionFrequency: string;
  };
}

interface DairyCow {
  id: string;
  name: string;
  notes?: string;
  inProduction?: boolean; // Nuevo campo para indicar si está en producción
}

interface DairyEditorProps {
  schema: DairySchema;
  onChange: (schema: DairySchema) => void;
}

export default function DairyEditor({ schema, onChange }: DairyEditorProps) {
  const [newCowName, setNewCowName] = useState("");
  const [newCowNotes, setNewCowNotes] = useState("");

  // Actualiza cualquier valor en el esquema
  const updateSchema = (newValues: Partial<DairySchema>) => {
    onChange({ ...schema, ...newValues });
  };

  // Agrega una nueva vaca
  const addCow = () => {
    if (!newCowName.trim()) return;
    
    const newCow: DairyCow = {
      id: `cow-${Date.now()}`,
      name: newCowName,
      notes: newCowNotes || undefined,
      inProduction: true // Por defecto, nueva vaca está en producción
    };
    
    const newItems = [...(schema.inventory?.items || []), newCow];
    
    updateSchema({
      inventory: {
        ...schema.inventory,
        items: newItems,
        total: newItems.length
      }
    });
    
    setNewCowName("");
    setNewCowNotes("");
  };

  // Elimina una vaca
  const removeCow = (cowId: string) => {
    const newItems = schema.inventory?.items?.filter(cow => cow.id !== cowId) || [];
    
    updateSchema({
      inventory: {
        ...schema.inventory,
        items: newItems,
        total: newItems.length
      }
    });
  };

  // Nuevo: Actualizar estado de producción de una vaca
  const toggleCowProduction = (cowId: string) => {
    const newItems = schema.inventory?.items?.map(cow => {
      if (cow.id === cowId) {
        return { ...cow, inProduction: !cow.inProduction };
      }
      return cow;
    }) || [];
    
    updateSchema({
      inventory: {
        ...schema.inventory,
        items: newItems
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Precio por litro</label>
        <input
          type="number"
          value={schema.price}
          onChange={(e) => updateSchema({ price: Number(e.target.value) })}
          className="w-full border rounded-md p-2"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Total de vacas</label>
        <input
          type="number"
          value={schema.inventory?.total || 0}
          onChange={(e) => 
            updateSchema({ 
              inventory: { 
                ...schema.inventory, 
                total: Number(e.target.value) 
              } 
            })
          }
          className="w-full border rounded-md p-2"
          min="0"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Registro Individual de Vacas</h3>
        
        <div className="space-y-4 mb-4">
          {schema.inventory?.items?.map(cow => (
            <div key={cow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-3">
                {/* Nuevo checkbox para estado de producción */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`cow-production-${cow.id}`}
                    checked={cow.inProduction !== false}
                    onChange={() => toggleCowProduction(cow.id)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor={`cow-production-${cow.id}`} className="ml-2 text-sm text-gray-600">
                    En producción
                  </label>
                </div>
                
                <div>
                  <p className="font-medium">{cow.name}</p>
                  {cow.notes && <p className="text-sm text-gray-500">{cow.notes}</p>}
                </div>
              </div>
              
              <button 
                onClick={() => removeCow(cow.id)}
                className="text-red-500 hover:text-red-700"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Agregar Nueva Vaca</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Nombre de la vaca"
              value={newCowName}
              onChange={(e) => setNewCowName(e.target.value)}
              className="flex-1 border rounded-md p-2"
            />
            <button 
              onClick={addCow}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!newCowName.trim()}
              type="button"
            >
              Agregar
            </button>
          </div>
          <textarea
            placeholder="Notas (opcional)"
            value={newCowNotes}
            onChange={(e) => setNewCowNotes(e.target.value)}
            className="w-full border rounded-md p-2 h-20"
          />
        </div>
      </div>
    </div>
  );
}