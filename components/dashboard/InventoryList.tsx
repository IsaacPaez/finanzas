"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import InventoryForm from "./InventoryForm";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export type InventoryItem = {
  id: string;
  business_id: string;
  name: string;
  quantity: number;
  unit: string;
  comments?: string;
  created_at?: string;
};

interface Props {
  items: InventoryItem[];
  businessId: string;
}

export default function InventoryList({ items, businessId }: Props) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const deleteItem = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este item?")) return;
    
    const supabase = createClient();
    await supabase.from("inventory_items").delete().eq("id", id);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Agregar item
        </button>
      </div>
      
      <table className="w-full table-auto">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verificar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentarios</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                No hay items en el inventario. Agrega uno nuevo.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className={checkedItems[item.id] ? "bg-green-50" : ""}>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleCheck(item.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      checkedItems[item.id] 
                        ? "bg-green-500 text-white" 
                        : "border border-gray-300"
                    }`}
                  >
                    {checkedItems[item.id] && <Check size={14} />}
                  </button>
                </td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">{item.unit}</td>
                <td className="px-6 py-4">{item.comments || "-"}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal para agregar */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Agregar Item al Inventario</h2>
        <InventoryForm 
          businessId={businessId}
          onComplete={() => {
            setAddModalOpen(false);
            router.refresh();
          }}
        />
      </Modal>

      {/* Modal para editar */}
      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)}>
        <h2 className="text-xl font-semibold mb-4">Editar Item</h2>
        {editingItem && (
          <InventoryForm
            businessId={businessId}
            item={editingItem}
            onComplete={() => {
              setEditingItem(null);
              router.refresh();
            }}
          />
        )}
      </Modal>
    </div>
  );
}