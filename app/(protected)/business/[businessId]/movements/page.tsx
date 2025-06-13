"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation"; // Eliminamos router ya que no se usa
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/BackButton";
import Modal from "@/components/dashboard/Modal";
import MovementForm from "@/components/dashboard/MovementForm";
import { Pencil, Trash2, Filter, X } from "lucide-react";

interface Movement {
  id: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
  vertical_id: string | null;
  vertical?: { name: string } | null;
}

interface Vertical {
  id: string;
  name: string;
}

export default function MovementsPage() {
  const { businessId } = useParams();
  // Eliminamos router ya que no se usa
  
  const [movements, setMovements] = useState<Movement[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [filter, setFilter] = useState<"all" | "ingreso" | "gasto">("all");
  const [verticalFilter, setVerticalFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10)
  });

  // Función para cargar movimientos (ahora con useCallback para evitar dependencias cíclicas)
  const loadMovements = useCallback(async () => {
    if (!businessId) return;
    
    setLoading(true);
    const supabase = createClient();
    
    // Cargar verticales para el filtro
    const { data: verticalsData } = await supabase
      .from("verticals")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("active", true);
      
    setVerticals(verticalsData || []);
    
    // Construir la consulta base
    let query = supabase
      .from("movements")
      .select(`
        *,
        vertical:vertical_id (
          name
        )
      `)
      .eq("business_id", businessId)
      .gte("date", dateRange.from)
      .lte("date", dateRange.to)
      .order("date", { ascending: false });
      
    // Aplicar filtro por tipo si no es "all"
    if (filter !== "all") {
      query = query.eq("type", filter);
    }
    
    // Aplicar filtro por vertical si no es "all"
    if (verticalFilter !== "all") {
      query = query.eq("vertical_id", verticalFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error cargando movimientos:", error);
    } else {
      setMovements(data || []);
    }
    
    setLoading(false);
  }, [businessId, filter, verticalFilter, dateRange]);

  // Cargar movimientos iniciales y cuando cambien los filtros
  useEffect(() => {
    loadMovements();
  }, [loadMovements]); // Ahora loadMovements está incluido como dependencia

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este movimiento?")) return;
    
    const supabase = createClient();
    const { error } = await supabase
      .from("movements")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Error eliminando movimiento:", error);
      return;
    }
    
    // Actualizar la lista sin recargar
    setMovements(movements.filter(m => m.id !== id));
  };

  // Verificar si un movimiento pasa los filtros actuales
  const passesFilters = (movement: Movement) => {
    const movDate = new Date(movement.date);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    // Ajustar toDate para incluir el final del día
    toDate.setHours(23, 59, 59, 999);
    
    const dateInRange = movDate >= fromDate && movDate <= toDate;
    const typeMatches = filter === "all" || movement.type === filter;
    const verticalMatches = verticalFilter === "all" || movement.vertical_id === verticalFilter;
    
    return dateInRange && typeMatches && verticalMatches;
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setFilter("all");
    setVerticalFilter("all");
    setDateRange({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
      to: new Date().toISOString().slice(0, 10)
    });
  };

  return (
    <div className="w-full pb-6">
      <div className="mb-6">
        <BackButton />
        <h1 className="text-2xl font-bold mt-2">Movimientos</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Botón de filtros en móvil */}
        <div className="flex sm:hidden w-full justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
          >
            <Filter size={16} />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
          
          <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            + Agregar
          </button>
        </div>
        
        {/* Filtros en panel expandible para móvil o siempre visibles en desktop */}
        <div 
          className={`
            w-full bg-white p-4 rounded-lg shadow mb-4 sm:mb-0 
            ${showFilters ? 'flex' : 'hidden'} 
            sm:flex flex-col sm:flex-row gap-4 transition-all
          `}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "ingreso" | "gasto")}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="gasto">Gastos</option>
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium mb-1">Vertical</label>
              <select 
                value={verticalFilter}
                onChange={(e) => setVerticalFilter(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos</option>
                {verticals.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium mb-1">Desde</label>
              <input 
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full border rounded-md p-2"
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium mb-1">Hasta</label>
              <input 
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full border rounded-md p-2"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 py-2 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <X size={14} />
                Limpiar
              </button>
            </div>
          </div>
        </div>
        
        {/* Botón agregar solo visible en desktop */}
        <button 
          onClick={() => setAddModalOpen(true)}
          className="hidden sm:block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg whitespace-nowrap"
        >
          + Agregar movimiento
        </button>
      </div>
      
      {/* Tabla de movimientos - Responsive */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabla para desktop */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left border-b">
                <th className="px-6 py-3 text-gray-500 font-medium uppercase text-xs">Fecha</th>
                <th className="px-6 py-3 text-gray-500 font-medium uppercase text-xs">Tipo</th>
                <th className="px-6 py-3 text-gray-500 font-medium uppercase text-xs">Vertical</th>
                <th className="px-6 py-3 text-right text-gray-500 font-medium uppercase text-xs">Monto</th>
                <th className="px-6 py-3 text-center text-gray-500 font-medium uppercase text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando movimientos...</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron movimientos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {new Date(movement.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        movement.type === "ingreso" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {movement.type === "ingreso" ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {movement.vertical?.name || "Manual"}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${
                      movement.type === "ingreso" ? "text-green-600" : "text-red-600"
                    }`}>
                      {movement.type === "ingreso" ? "+" : "-"}
                      ${Math.abs(movement.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setEditingMovement(movement)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(movement.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Vista de tarjetas para móvil */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando movimientos...</div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron movimientos para los filtros seleccionados.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {movements.map((movement) => (
                <li key={movement.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mb-1 ${
                          movement.type === "ingreso" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {movement.type === "ingreso" ? "Ingreso" : "Gasto"}
                        </span>
                        <div className="text-sm text-gray-500">
                          {new Date(movement.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`font-medium text-lg ${
                        movement.type === "ingreso" ? "text-green-600" : "text-red-600"
                      }`}>
                        {movement.type === "ingreso" ? "+" : "-"}
                        ${Math.abs(movement.amount).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500 mr-1">Vertical:</span>
                        <span className="font-medium">{movement.vertical?.name || "Manual"}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setEditingMovement(movement)}
                          className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
                          aria-label="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(movement.id)}
                          className="p-1 rounded-md text-red-600 hover:bg-red-50"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Modal para agregar */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Nuevo Movimiento</h2>
        <MovementForm 
          businessId={businessId as string}
          onComplete={(newMovement) => {
            setAddModalOpen(false);
            
            // Recargamos los datos para asegurarnos de tener todo actualizado
            loadMovements();
            
            // Si el nuevo movimiento pasa los filtros, lo añadimos inmediatamente
            // para una experiencia más fluida mientras se recarga
            if (newMovement && passesFilters(newMovement)) {
              setMovements(prev => [newMovement, ...prev]);
            }
          }} 
        />
      </Modal>
      
      {/* Modal para editar */}
      <Modal isOpen={!!editingMovement} onClose={() => setEditingMovement(null)}>
        <h2 className="text-xl font-semibold mb-4">Editar Movimiento</h2>
        {editingMovement && (
          <MovementForm
            businessId={businessId as string}
            movement={editingMovement}
            onComplete={(updatedMovement) => {
              setEditingMovement(null);
              
              // Recargamos los datos para asegurarnos de tener todo actualizado
              loadMovements();
              
              // Actualizamos inmediatamente el movimiento editado si pasa los filtros
              if (updatedMovement && passesFilters(updatedMovement)) {
                setMovements(prev => 
                  prev.map(mov => 
                    mov.id === updatedMovement.id ? updatedMovement : mov
                  )
                );
              }
            }}
          />
        )}
      </Modal>
    </div>
  );
}