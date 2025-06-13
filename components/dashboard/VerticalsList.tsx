"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";

// Definir interfaces para tipos
interface Vertical {
  id: string;
  name: string;
  description: string;
  variables_schema: {
    unit: string;
    price: number;
  };
  active: boolean;
  is_template: boolean;
}

// Eliminamos la interfaz Template redundante y usamos directamente Vertical

interface VerticalProps {
  verticals: Vertical[];
  templates: Vertical[]; // Usamos Vertical directamente aquí
  businessId: string;
}

interface FormData {
  name: string;
  description: string;
  unit: string;
  price: number;
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

  const handleEditClick = (vertical: Vertical) => {
    setEditingVertical(vertical);
    setFormData({
      name: vertical.name || "",
      description: vertical.description || "",
      unit: vertical.variables_schema?.unit || "",
      price: vertical.variables_schema?.price || 0,
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
    const variables_schema = {
      unit: formData.unit,
      price: Number(formData.price)
    };
    
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
        
      if (error) {
        console.error("Error al actualizar:", error);
        alert("Error al actualizar el vertical");
      } else {
        setEditingVertical(null);
        router.refresh();
      }
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
        
      if (error) {
        console.error("Error al crear:", error);
        alert("Error al crear el vertical");
      } else {
        setShowAddModal(false);
        router.refresh();
      }
    }
    
    resetForm();
    setLoading(false);
  };

  const addFromTemplate = async (template: Vertical) => {
    setLoading(true);
    const supabase = createClient();
    
    // Crear copia del template
    const { error } = await supabase
      .from("verticals")
      .insert([{
        business_id: businessId,
        name: template.name,
        description: template.description,
        active: true,
        is_template: false,
        variables_schema: template.variables_schema
      }]);
      
    if (error) {
      console.error("Error al crear desde template:", error);
      alert("Error al crear desde template");
    } else {
      setShowTemplateModal(false);
      router.refresh();
    }
    
    setLoading(false);
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
                <div className="mt-2 text-sm">
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