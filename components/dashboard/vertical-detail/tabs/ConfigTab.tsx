import { useState } from "react";
import DairyEditor from "../../vertical-templates/DairyEditor";
import EggsEditor from "../../vertical-templates/EggsEditor";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  VerticalSchema, 
  DairySchema, 
  EggSchema, 
  DairyTemplateConfig,
  EggTemplateConfig 
} from "../types/interfaces";

interface ConfigTabProps {
  schema: VerticalSchema;
  verticalId: string;
  loading: boolean;
}

export default function ConfigTab({ schema: initialSchema, verticalId, loading }: ConfigTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [schema, setSchema] = useState(() => {
    // Normalizar schema según el tipo para asegurar que tenga todas las propiedades
    if (initialSchema.type === 'dairy') {
      const dairySchema = initialSchema as DairySchema;
      return {
        ...dairySchema,
        templateConfig: {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0",
          customFields: {},
          trackIndividualProduction: true,
          productionFrequency: 'daily' as const,
          milkingTimes: 2,
          qualityMetrics: false,
          ...dairySchema.templateConfig
        } as DairyTemplateConfig,
        inventory: dairySchema.inventory || { items: [] }
      } as DairySchema;
    } else if (initialSchema.type === 'eggs') {
      const eggSchema = initialSchema as EggSchema;
      return {
        ...eggSchema,
        templateConfig: {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0",
          customFields: {},
          trackByType: true,
          eggGradingEnabled: false,
          collectionFrequency: 'daily' as const,
          qualityControl: false,
          ...eggSchema.templateConfig
        } as EggTemplateConfig,
        inventory: eggSchema.inventory || { total: 0 },
        productionTypes: eggSchema.productionTypes || []
      } as EggSchema;
    }
    
    return initialSchema;
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      // Actualizar templateConfig antes de guardar
      const updatedSchema = {
        ...schema,
        templateConfig: {
          ...schema.templateConfig,
          lastUpdated: new Date().toISOString()
        }
      };
      
      const { error } = await supabase
        .from('verticals')
        .update({ variables_schema: updatedSchema })
        .eq('id', verticalId);
        
      if (error) throw error;
      
      setIsEditing(false);
      router.refresh();
      alert("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar el estado inicial normalizado
    if (initialSchema.type === 'dairy') {
      const dairySchema = initialSchema as DairySchema;
      setSchema({
        ...dairySchema,
        templateConfig: {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0",
          customFields: {},
          trackIndividualProduction: true,
          productionFrequency: 'daily' as const,
          milkingTimes: 2,
          qualityMetrics: false,
          ...dairySchema.templateConfig
        } as DairyTemplateConfig,
        inventory: dairySchema.inventory || { items: [] }
      } as DairySchema);
    } else if (initialSchema.type === 'eggs') {
      const eggSchema = initialSchema as EggSchema;
      setSchema({
        ...eggSchema,
        templateConfig: {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0",
          customFields: {},
          trackByType: true,
          eggGradingEnabled: false,
          collectionFrequency: 'daily' as const,
          qualityControl: false,
          ...eggSchema.templateConfig
        } as EggTemplateConfig,
        inventory: eggSchema.inventory || { total: 0 },
        productionTypes: eggSchema.productionTypes || []
      } as EggSchema);
    } else {
      setSchema(initialSchema);
    }
    setIsEditing(false);
  };

  // ✅ FUNCIÓN HELPER PARA ACTUALIZAR SCHEMA DE FORMA TYPE-SAFE
  const updateSchemaPrice = (newPrice: number) => {
    if (schema.type === 'dairy') {
      const dairySchema = schema as DairySchema;
      setSchema({
        ...dairySchema,
        price: newPrice
      });
    } else if (schema.type === 'eggs') {
      const eggSchema = schema as EggSchema;
      setSchema({
        ...eggSchema,
        price: newPrice
      });
    }
  };

  const renderSpecificEditor = () => {
    if (schema.type === "dairy") {
      const dairySchema = schema as DairySchema;
      
      return isEditing ? (
        <DairyEditor 
          schema={dairySchema} 
          onChange={(updatedSchema) => setSchema(updatedSchema)}
        />
      ) : (
        <DairyReadOnlyView schema={dairySchema} />
      );
    } else if (schema.type === "eggs") {
      const eggSchema = schema as EggSchema;
      
      return isEditing ? (
        <EggsEditor 
          schema={eggSchema} 
          onChange={(updatedSchema) => setSchema(updatedSchema)}
        />
      ) : (
        <EggsReadOnlyView schema={eggSchema} />
      );
    }
    
    // ✅ SECCIÓN GENERAL CORREGIDA CON TYPE GUARDS
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Configuración General</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Precio por unidad</label>
            {isEditing ? (
              <input
                type="number"
                value={(schema as DairySchema | EggSchema).price || 0}
                onChange={(e) => updateSchemaPrice(Number(e.target.value))}
                className="w-full border rounded-md p-2"
                step="0.01"
                min="0"
              />
            ) : (
              <input
                type="number"
                value={(schema as DairySchema | EggSchema).price || 0}
                className="w-full border rounded-md p-2 bg-gray-100"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unidad</label>
            <input
              type="text"
              value={(schema as DairySchema | EggSchema).unit || ""}
              className="w-full border rounded-md p-2 bg-gray-100"
              readOnly
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con botones de acción */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Configuración de {schema.type === 'dairy' ? 'Lechería' : 'Huevos'}
        </h2>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✏️ Editar Configuración
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Estado de edición */}
      {isEditing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            ⚠️ Modo de edición activo. Los cambios no se guardarán hasta que hagas clic en &quot;Guardar Cambios&quot;.
          </p>
        </div>
      )}

      {/* Información de configuración */}
      {schema.templateConfig && (
        <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
          <p>Última actualización: {
            schema.templateConfig.lastUpdated 
              ? new Date(schema.templateConfig.lastUpdated).toLocaleString('es-ES')
              : 'No disponible'
          }</p>
          <p>Versión: {schema.templateConfig.version || 'No especificada'}</p>
          
          {/* Mostrar configuraciones específicas */}
          {schema.type === 'dairy' && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p>Seguimiento individual: {(schema.templateConfig as DairyTemplateConfig).trackIndividualProduction ? 'Sí' : 'No'}</p>
              <p>Frecuencia: {(schema.templateConfig as DairyTemplateConfig).productionFrequency || 'Daily'}</p>
            </div>
          )}
          
          {schema.type === 'eggs' && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p>Seguimiento por tipo: {(schema.templateConfig as EggTemplateConfig).trackByType ? 'Sí' : 'No'}</p>
              <p>Frecuencia de recolección: {(schema.templateConfig as EggTemplateConfig).collectionFrequency || 'Daily'}</p>
            </div>
          )}
        </div>
      )}

      {/* Editor específico */}
      {renderSpecificEditor()}
      
      {(loading || saving) && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">
            {saving ? "Guardando configuración..." : "Cargando configuración..."}
          </p>
        </div>
      )}
    </div>
  );
}

// Componente para vista de solo lectura de Dairy
function DairyReadOnlyView({ schema }: { schema: DairySchema }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Configuración de Lechería</h3>
        <p className="text-sm text-gray-600">
          Configuración actual de la vertical de lechería.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Precio por litro</label>
          <div className="w-full border rounded-md p-2 bg-gray-100">
            ${schema.price?.toFixed(2) || "0.00"}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unidad</label>
          <div className="w-full border rounded-md p-2 bg-gray-100">
            {schema.unit || "litros"}
          </div>
        </div>
      </div>

      {/* Configuraciones específicas de lechería */}
      <div className="bg-blue-50 p-3 rounded">
        <h4 className="text-sm font-medium mb-2">Configuraciones de Producción</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Seguimiento individual:</span>
            <span className="ml-2 font-medium">
              {schema.templateConfig.trackIndividualProduction ? 'Activado' : 'Desactivado'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Frecuencia:</span>
            <span className="ml-2 font-medium capitalize">
              {schema.templateConfig.productionFrequency || 'Diaria'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Ordeños por día:</span>
            <span className="ml-2 font-medium">
              {schema.templateConfig.milkingTimes || 2}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Métricas de calidad:</span>
            <span className="ml-2 font-medium">
              {schema.templateConfig.qualityMetrics ? 'Activadas' : 'Desactivadas'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Inventario de Vacas</label>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Total de vacas:</p>
              <p className="text-xl font-bold">{schema.inventory?.items?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vacas en producción:</p>
              <p className="text-xl font-bold text-green-600">
                {schema.inventory?.items?.filter((item) => item.inProduction !== false).length || 0}
              </p>
            </div>
          </div>
          
          {schema.inventory?.items && schema.inventory.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Lista de Vacas:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {schema.inventory.items.map((cow) => (
                  <div key={cow.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{cow.name}</span>
                      {cow.notes && <p className="text-xs text-gray-500">{cow.notes}</p>}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      cow.inProduction !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cow.inProduction !== false ? 'En producción' : 'Inactiva'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para vista de solo lectura de Eggs
function EggsReadOnlyView({ schema }: { schema: EggSchema }) {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Configuración de Huevos</h3>
        <p className="text-sm text-gray-600">
          Configuración actual de la vertical de huevos.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Precio promedio</label>
          <div className="w-full border rounded-md p-2 bg-gray-100">
            ${schema.price?.toFixed(2) || "0.00"}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total de gallinas</label>
          <div className="w-full border rounded-md p-2 bg-gray-100">
            {schema.inventory?.total || 0}
          </div>
        </div>
      </div>

      {/* Configuraciones específicas de huevos */}
      <div className="bg-yellow-50 p-3 rounded">
        <h4 className="text-sm font-medium mb-2">Configuraciones de Producción</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Seguimiento por tipo:</span>
            <span className="ml-2 font-medium">
              {schema.templateConfig.trackByType ? 'Activado' : 'Desactivado'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Clasificación:</span>
            <span className="ml-2 font-medium">
              {schema.templateConfig.eggGradingEnabled ? 'Activada' : 'Desactivada'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Frecuencia de recolección:</span>
            <span className="ml-2 font-medium capitalize">
              {schema.templateConfig.collectionFrequency || 'Diaria'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Control de calidad:</span>
            <span className="ml-2 font-medium">
              {schema.templateConfig.qualityControl ? 'Activado' : 'Desactivado'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tipos de Huevos</label>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600 mb-3">
            Tipos configurados: {schema.productionTypes?.length || 0}
          </p>
          
          {schema.productionTypes && schema.productionTypes.length > 0 && (
            <div className="space-y-2">
              {schema.productionTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{type.name}</span>
                    {type.description && <p className="text-xs text-gray-500">{type.description}</p>}
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    ${type.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}