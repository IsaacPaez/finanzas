"use client";
import { DairySchema } from "../vertical-detail/types/interfaces";

interface DairyEditorProps {
  schema: DairySchema;
  onChange: (schema: DairySchema) => void;
}

export default function DairyEditor({ schema, onChange }: DairyEditorProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Editor de Configuración - Lechería</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Precio por litro</label>
            <input
              type="number"
              value={schema.price}
              onChange={(e) => onChange({...schema, price: Number(e.target.value)})}
              className="w-full border rounded-md p-2"
              step="0.01"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Unidad</label>
            <input
              type="text"
              value={schema.unit}
              onChange={(e) => onChange({...schema, unit: e.target.value})}
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Configuraciones de Producción</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={schema.templateConfig.trackIndividualProduction}
                  onChange={(e) => onChange({
                    ...schema,
                    templateConfig: {
                      ...schema.templateConfig,
                      trackIndividualProduction: e.target.checked
                    }
                  })}
                />
                <span className="text-sm">Seguimiento individual por vaca</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Frecuencia de producción</label>
              <select
                value={schema.templateConfig.productionFrequency}
                onChange={(e) => onChange({
                  ...schema,
                  templateConfig: {
                    ...schema.templateConfig,
                    productionFrequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                  }
                })}
                className="w-full border rounded-md p-2"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Ordeños por día</label>
              <input
                type="number"
                value={schema.templateConfig.milkingTimes}
                onChange={(e) => onChange({
                  ...schema,
                  templateConfig: {
                    ...schema.templateConfig,
                    milkingTimes: Number(e.target.value)
                  }
                })}
                className="w-full border rounded-md p-2"
                min="1"
                max="5"
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={schema.templateConfig.qualityMetrics}
                  onChange={(e) => onChange({
                    ...schema,
                    templateConfig: {
                      ...schema.templateConfig,
                      qualityMetrics: e.target.checked
                    }
                  })}
                />
                <span className="text-sm">Activar métricas de calidad</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Inventario de Vacas</h4>
          <div className="bg-white p-4 rounded border">
            <p className="text-sm text-gray-600 mb-2">
              Total de vacas: {schema.inventory?.items?.length || 0}
            </p>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {schema.inventory?.items?.map((cow, index) => (
                <div key={cow.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{cow.name}</span>
                    {cow.notes && <p className="text-xs text-gray-500">{cow.notes}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={cow.inProduction !== false}
                        onChange={(e) => {
                          const updatedItems = [...(schema.inventory?.items || [])];
                          updatedItems[index] = { ...cow, inProduction: e.target.checked };
                          onChange({
                            ...schema,
                            inventory: {
                              ...schema.inventory,
                              items: updatedItems
                            }
                          });
                        }}
                      />
                      <span className="text-xs">En producción</span>
                    </label>
                    <button
                      onClick={() => {
                        const updatedItems = schema.inventory?.items?.filter((_, i) => i !== index) || [];
                        onChange({
                          ...schema,
                          inventory: {
                            ...schema.inventory,
                            items: updatedItems
                          }
                        });
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Eliminar vaca"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No hay vacas configuradas
                </p>
              )}
            </div>
            
            <button
              onClick={() => {
                const newCow = {
                  id: `cow-${Date.now()}`,
                  name: `Vaca ${(schema.inventory?.items?.length || 0) + 1}`,
                  inProduction: true,
                  notes: ""
                };
                
                onChange({
                  ...schema,
                  inventory: {
                    ...schema.inventory,
                    items: [...(schema.inventory?.items || []), newCow]
                  }
                });
              }}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              + Agregar Vaca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}