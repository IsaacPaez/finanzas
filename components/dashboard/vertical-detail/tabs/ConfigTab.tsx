import { useState } from "react";
import DairyEditor from "../editors/DairyEditor";
import EggsEditor from "../editors/EggsEditor";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ConfigTabProps {
  schema: any;
  verticalId: string;
  loading: boolean;
}

export default function ConfigTab({ schema: initialSchema, verticalId, loading }: ConfigTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [schema, setSchema] = useState(initialSchema);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('verticals')
        .update({ variables_schema: schema })
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
    setSchema(initialSchema); // Restaurar estado original
    setIsEditing(false);
  };

  const renderSpecificEditor = () => {
    if (schema.type === "dairy") {
      return isEditing ? (
        <DairyEditor 
          schema={schema} 
          onChange={setSchema}
        />
      ) : (
        <DairyReadOnlyView schema={schema} />
      );
    } else if (schema.type === "eggs") {
      return isEditing ? (
        <EggsEditor 
          schema={schema} 
          onChange={setSchema}
        />
      ) : (
        <EggsReadOnlyView schema={schema} />
      );
    }
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Configuración General</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Precio por unidad</label>
            {isEditing ? (
              <input
                type="number"
                value={schema.price || 0}
                onChange={(e) => setSchema({...schema, price: Number(e.target.value)})}
                className="w-full border rounded-md p-2"
                step="0.01"
                min="0"
              />
            ) : (
              <input
                type="number"
                value={schema.price || 0}
                className="w-full border rounded-md p-2 bg-gray-100"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unidad</label>
            <input
              type="text"
              value={schema.unit || ""}
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
        <h2 className="text-xl font-semibold">Configuración de {schema.type === 'dairy' ? 'Lechería' : 'Huevos'}</h2>
        
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
            ⚠️ Modo de edición activo. Los cambios no se guardarán hasta que hagas clic en "Guardar Cambios".
          </p>
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
function DairyReadOnlyView({ schema }: { schema: any }) {
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
                {schema.inventory?.items?.filter((item: any) => item.inProduction !== false).length || 0}
              </p>
            </div>
          </div>
          
          {schema.inventory?.items && schema.inventory.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Lista de Vacas:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {schema.inventory.items.map((cow: any) => (
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
function EggsReadOnlyView({ schema }: { schema: any }) {
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

      <div>
        <label className="block text-sm font-medium mb-2">Tipos de Huevos</label>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600 mb-3">
            Tipos configurados: {schema.productionTypes?.length || 0}
          </p>
          
          {schema.productionTypes && schema.productionTypes.length > 0 && (
            <div className="space-y-2">
              {schema.productionTypes.map((type: any) => (
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