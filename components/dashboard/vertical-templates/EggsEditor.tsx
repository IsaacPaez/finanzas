"use client";
import { EggSchema } from "../vertical-detail/types/interfaces";

interface EggsEditorProps {
  schema: EggSchema;
  onChange: (schema: EggSchema) => void;
}

export default function EggsEditor({ schema, onChange }: EggsEditorProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Editor de Configuración - Huevos</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Precio promedio</label>
            <input
              type="number"
              value={schema.price}
              onChange={(e) => onChange({ ...schema, price: Number(e.target.value) })}
              className="w-full border rounded-md p-2"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Total de gallinas</label>
            <input
              type="number"
              value={schema.inventory?.total || 0}
              onChange={(e) =>
                onChange({
                  ...schema,
                  inventory: {
                    ...schema.inventory,
                    total: Number(e.target.value),
                  },
                })
              }
              className="w-full border rounded-md p-2"
              min="0"
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
                  checked={schema.templateConfig.trackByType}
                  onChange={(e) =>
                    onChange({
                      ...schema,
                      templateConfig: {
                        ...schema.templateConfig,
                        trackByType: e.target.checked,
                      },
                    })
                  }
                />
                <span className="text-sm">Seguimiento por tipo de huevo</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={schema.templateConfig.eggGradingEnabled}
                  onChange={(e) =>
                    onChange({
                      ...schema,
                      templateConfig: {
                        ...schema.templateConfig,
                        eggGradingEnabled: e.target.checked,
                      },
                    })
                  }
                />
                <span className="text-sm">Clasificación de huevos</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Frecuencia de recolección</label>
              <select
                value={schema.templateConfig.collectionFrequency}
                onChange={(e) =>
                  onChange({
                    ...schema,
                    templateConfig: {
                      ...schema.templateConfig,
                      collectionFrequency: e.target.value as "daily" | "twice-daily" | "custom",
                    },
                  })
                }
                className="w-full border rounded-md p-2"
              >
                <option value="daily">Diaria</option>
                <option value="twice-daily">Dos veces al día</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={schema.templateConfig.qualityControl}
                  onChange={(e) =>
                    onChange({
                      ...schema,
                      templateConfig: {
                        ...schema.templateConfig,
                        qualityControl: e.target.checked,
                      },
                    })
                  }
                />
                <span className="text-sm">Control de calidad</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Tipos de Huevos</h4>
          <div className="bg-white p-4 rounded border">
            <p className="text-sm text-gray-600 mb-2">
              Tipos configurados: {schema.productionTypes?.length || 0}
            </p>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {schema.productionTypes?.map((type, index) => (
                <div key={type.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={type.name}
                      onChange={(e) => {
                        const updatedTypes = [...(schema.productionTypes || [])];
                        updatedTypes[index] = { ...type, name: e.target.value };
                        onChange({
                          ...schema,
                          productionTypes: updatedTypes,
                        });
                      }}
                      className="w-full border rounded p-1 text-sm"
                      placeholder="Nombre del tipo"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={type.price}
                      onChange={(e) => {
                        const updatedTypes = [...(schema.productionTypes || [])];
                        updatedTypes[index] = { ...type, price: Number(e.target.value) };
                        onChange({
                          ...schema,
                          productionTypes: updatedTypes,
                        });
                      }}
                      className="w-20 border rounded p-1 text-sm"
                      step="0.01"
                      min="0"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={type.active}
                        onChange={(e) => {
                          const updatedTypes = [...(schema.productionTypes || [])];
                          updatedTypes[index] = { ...type, active: e.target.checked };
                          onChange({
                            ...schema,
                            productionTypes: updatedTypes,
                          });
                        }}
                      />
                      <span className="ml-1 text-xs">Activo</span>
                    </label>
                    <button
                      onClick={() => {
                        const updatedTypes = schema.productionTypes?.filter((_, i) => i !== index) || [];
                        onChange({
                          ...schema,
                          productionTypes: updatedTypes,
                        });
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Eliminar tipo"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No hay tipos de huevos configurados</p>
              )}
            </div>

            <button
              onClick={() => {
                const newType = {
                  id: `type-${Date.now()}`,
                  name: `Tipo ${(schema.productionTypes?.length || 0) + 1}`,
                  price: 0,
                  active: true,
                  description: "",
                };

                onChange({
                  ...schema,
                  productionTypes: [...(schema.productionTypes || []), newType],
                });
              }}
              className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
            >
              + Agregar Tipo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}