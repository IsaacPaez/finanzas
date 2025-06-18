"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export interface EggsSchema {
  type: "eggs";
  unit: string;
  price: number;
  inventory: {
    total: number;
  };
  productionTypes: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
  }>;
  templateConfig: {
    trackByType: boolean;
    productionFrequency: string;
  };
}

interface EggsEditorProps {
  schema: EggsSchema;
  onChange: (schema: EggsSchema) => void;
}

export default function EggsEditor({ schema, onChange }: EggsEditorProps) {
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypePrice, setNewTypePrice] = useState<number>(0);
  const [newTypeDescription, setNewTypeDescription] = useState("");

  // Actualiza cualquier valor en el esquema
  const updateSchema = (newValues: Partial<EggsSchema>) => {
    onChange({ ...schema, ...newValues });
  };

  // Agrega un nuevo tipo de huevo
  const addEggType = () => {
    if (!newTypeName.trim()) return;
    
    const newType = {
      id: `egg-${Date.now()}`,
      name: newTypeName,
      price: newTypePrice,
      description: newTypeDescription || undefined
    };
    
    const newTypes = [...(schema.productionTypes || []), newType];
    
    updateSchema({
      productionTypes: newTypes
    });
    
    setNewTypeName("");
    setNewTypePrice(0);
    setNewTypeDescription("");
  };

  // Elimina un tipo de huevo
  const removeEggType = (typeId: string) => {
    const newTypes = schema.productionTypes?.filter(type => type.id !== typeId) || [];
    updateSchema({ productionTypes: newTypes });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Precio base por huevo</label>
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
        <label className="block text-sm font-medium mb-1">Total de gallinas</label>
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
        <h3 className="text-lg font-medium mb-3">Tipos de Huevos</h3>
        
        <div className="space-y-4 mb-4">
          {schema.productionTypes?.map(eggType => (
            <div key={eggType.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{eggType.name}</p>
                  <span className="text-sm text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    ${eggType.price.toFixed(2)}
                  </span>
                </div>
                {eggType.description && (
                  <p className="text-sm text-gray-500">{eggType.description}</p>
                )}
              </div>
              <button 
                onClick={() => removeEggType(eggType.id)}
                className="text-red-500 hover:text-red-700"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Agregar Nuevo Tipo de Huevo</h4>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder="Nombre (ej. AA)"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="col-span-2 border rounded-md p-2"
            />
            <input
              type="number"
              placeholder="Precio"
              value={newTypePrice}
              onChange={(e) => setNewTypePrice(Number(e.target.value))}
              className="border rounded-md p-2"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex gap-2">
            <textarea
              placeholder="Descripción (opcional)"
              value={newTypeDescription}
              onChange={(e) => setNewTypeDescription(e.target.value)}
              className="flex-1 border rounded-md p-2 h-12"
            />
            <button 
              onClick={addEggType}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!newTypeName.trim()}
              type="button"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}