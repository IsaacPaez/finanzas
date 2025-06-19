"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import DairyEditor from "./vertical-templates/DairyEditor";
import EggsEditor from "./vertical-templates/EggsEditor";
import { VerticalSchema, DairySchema, EggSchema } from "./vertical-detail/types/interfaces"; // ✅ Importar interfaces específicas

// ✅ Usar interface tipada en lugar de any
interface Vertical {
  id: string;
  name: string;
  description: string;
  variables_schema: VerticalSchema; // ✅ Cambiar any por VerticalSchema
  active: boolean;
  is_template: boolean;
}

interface VerticalProps {
  verticals: Vertical[];
  templates: Vertical[];
  businessId: string;
}

// ✅ Actualizar FormData para usar schema tipado
interface FormData {
  name: string;
  description: string;
  unit: string;
  price: number;
  variables_schema?: VerticalSchema; // ✅ Cambiar any por VerticalSchema
}

export default function VerticalsList({ verticals, templates, businessId }: VerticalProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingVertical, setEditingVertical] = useState<Vertical | null>(null);
  const [loading, setLoading] = useState(false);

  // State for new/edit form
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    unit: "",
    price: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      unit: "",
      price: 0,
    });
  };

  // Función para renderizar el editor específico según el tipo de vertical
  const renderSpecializedEditor = (vertical: Vertical) => {
    const schema = vertical.variables_schema;
    
    if (schema?.type === "dairy") {
      return (
        <DairyEditor 
          schema={schema} 
          onChange={(newSchema) => {
            setFormData({
              ...formData,
              variables_schema: newSchema
            });
          }}
        />
      );
    }
    
    if (schema?.type === "eggs") {
      return (
        <EggsEditor 
          schema={schema}
          onChange={(newSchema) => {
            setFormData({
              ...formData,
              variables_schema: newSchema
            });
          }}
        />
      );
    }
    
    // Editor genérico por defecto
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Unidad</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full border rounded-md p-2"
            placeholder="kg, litros, unidades..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Precio por unidad</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full border rounded-md p-2"
            required
          />
        </div>
      </div>
    );
  };

  const handleEditClick = (vertical: Vertical) => {
    setEditingVertical(vertical);
    setFormData({
      name: vertical.name || "",
      description: vertical.description || "",
      unit: vertical.variables_schema?.unit || "",
      price: vertical.variables_schema?.price || 0,
      variables_schema: vertical.variables_schema // Guardar el schema completo
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este vertical? Esta acción no se puede deshacer.")) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("verticals")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Error al eliminar el vertical:", error);
      alert("Error al eliminar el vertical");
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const supabase = createClient();
    
    // ✅ Crear un schema básico tipado si no existe uno especializado
    const variables_schema: VerticalSchema = formData.variables_schema || {
      type: 'dairy', // Valor por defecto, se puede cambiar según necesidad
      unit: formData.unit,
      price: Number(formData.price),
      templateConfig: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
        customFields: {},
        trackIndividualProduction: true,
        productionFrequency: 'daily',
        milkingTimes: 2,
        qualityMetrics: false
      }
    } as DairySchema;
    
    // Actualizar las propiedades básicas
    if (variables_schema) {
      variables_schema.unit = formData.unit;
      variables_schema.price = Number(formData.price);
    }
    
    try {
      if (editingVertical) {
        // Actualizar vertical existente
        const { error } = await supabase
          .from("verticals")
          .update({
            name: formData.name,
            description: formData.description,
            variables_schema
          })
          .eq("id", editingVertical.id);
          
        if (error) throw error;
        setEditingVertical(null);
      } else {
        // Crear nuevo vertical
        const { error } = await supabase
          .from("verticals")
          .insert([{
            business_id: businessId,
            name: formData.name,
            description: formData.description,
            active: true,
            is_template: false,
            variables_schema
          }]);
          
        if (error) throw error;
        setShowAddModal(false);
      }
      
      router.refresh();
      resetForm();
    } catch (error) {
      console.error("Error al guardar vertical:", error);
      
      // Mostrar error específico
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error desconocido al guardar el vertical";
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función corregida para evitar el error de spread
  const addFromTemplate = async (template: Vertical) => {
    setLoading(true);
    
    try {
      // ✅ Verificar que template.variables_schema existe y es un objeto válido
      if (!template.variables_schema || typeof template.variables_schema !== 'object') {
        throw new Error('Schema de plantilla inválido');
      }

      let modifiedSchema: VerticalSchema;
      
      if (template.variables_schema.type === "dairy") {
        // ✅ Type assertion y construcción explícita para dairy
        const dairyTemplate = template.variables_schema as DairySchema;
        modifiedSchema = {
          type: "dairy",
          unit: dairyTemplate.unit,
          price: dairyTemplate.price,
          templateConfig: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            customFields: {},
            trackIndividualProduction: true,
            productionFrequency: 'daily',
            milkingTimes: 2,
            qualityMetrics: false,
            ...dairyTemplate.templateConfig
          },
          inventory: {
            items: [] // Inicializar con array vacío para nueva instancia
          },
          cowProductionHistory: []
        } as DairySchema;
        
      } else if (template.variables_schema.type === "eggs") {
        // ✅ Type assertion y construcción explícita para eggs
        const eggTemplate = template.variables_schema as EggSchema;
        modifiedSchema = {
          type: "eggs",
          unit: eggTemplate.unit,
          price: eggTemplate.price,
          templateConfig: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            customFields: {},
            trackByType: true,
            eggGradingEnabled: false,
            collectionFrequency: 'daily',
            qualityControl: false,
            ...eggTemplate.templateConfig
          },
          inventory: {
            total: 0 // Inicializar con 0 para nueva instancia
          },
          productionTypes: eggTemplate.productionTypes ? [...eggTemplate.productionTypes] : [],
          eggProductionHistory: []
        } as EggSchema;
        
      } else {
        // ✅ Schema genérico por defecto (fallback)
        const genericSchema = template.variables_schema as VerticalSchema;
        modifiedSchema = {
          type: 'dairy', // Tipo por defecto
          unit: genericSchema.unit || 'litros',
          price: genericSchema.price || 0,
          templateConfig: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            customFields: {},
            trackIndividualProduction: true,
            productionFrequency: 'daily',
            milkingTimes: 2,
            qualityMetrics: false
          },
          inventory: {
            items: []
          }
        } as DairySchema;
      }
      
      // Cargar los datos de la plantilla en el formulario
      setFormData({
        name: template.name,
        description: template.description || "",
        unit: modifiedSchema.unit,
        price: modifiedSchema.price,
        variables_schema: modifiedSchema
      });
      
      // Cerrar modal de plantillas y abrir modal de edición
      setShowTemplateModal(false);
      setShowAddModal(true);
      
    } catch (error) {
      console.error("Error al cargar plantilla:", error);
      alert("Error al cargar la plantilla");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Verticales Activos</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Usar plantilla
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Agregar vertical
          </button>
        </div>
      </div>

      {/* Tabla mejorada de verticales */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidad
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {verticals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay verticales creados. Agrega uno nuevo o usa una plantilla.
                </td>
              </tr>
            ) : (
              verticals.map((vertical) => (
                <tr key={vertical.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="font-medium text-gray-900">{vertical.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-500 line-clamp-2">{vertical.description || "—"}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-900">{vertical.variables_schema?.unit || "—"}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-900">
                      {vertical.variables_schema?.price ? `$${vertical.variables_schema.price.toLocaleString()}` : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-4">
                      {/* Botón para ver detalle */}
                      <button
                        onClick={() => router.push(`/business/${businessId}/verticals/${vertical.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditClick(vertical)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(vertical.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar vertical */}
      <Modal
        isOpen={showAddModal || !!editingVertical}
        onClose={() => {
          setShowAddModal(false);
          setEditingVertical(null);
          resetForm();
        }}
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingVertical ? "Editar Vertical" : "Nuevo Vertical"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-md p-2"
              rows={3}
            />
          </div>
          
          {/* Aquí llamamos a nuestro renderizador especializado en lugar del grid fijo */}
          {editingVertical ? 
            renderSpecializedEditor(editingVertical) : 
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Unidad</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border rounded-md p-2"
                  placeholder="kg, litros, unidades..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio por unidad</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>
            </div>
          }
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading
              ? "Guardando..."
              : editingVertical
              ? "Actualizar vertical"
              : "Crear vertical"}
          </button>
        </form>
      </Modal>

      {/* Modal para seleccionar plantilla */}
      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)}>
        <h2 className="text-xl font-semibold mb-4">Seleccionar Plantilla</h2>
        
        <div className="grid gap-4">
          {templates.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No hay plantillas disponibles</div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => addFromTemplate(template)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                  <Plus size={20} className="text-green-600" />
                </div>
                <div className="mt-2 text-small">
                  <span className="text-gray-600">
                    {template.variables_schema?.unit} a ${template.variables_schema?.price}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}