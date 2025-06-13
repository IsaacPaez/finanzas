"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import BusinessChart from "@/components/dashboard/BusinessChart";
import Modal from "@/components/dashboard/Modal";
import MovementForm from "@/components/dashboard/MovementForm";
import { ArrowRight, PlusCircle } from "lucide-react";

interface Business {
  id: string;
  name: string;
  type: string;
  description: string;
  image_url?: string;
  unit?: string;
}

interface Metrics {
  ingresos: number;
  gastos: number;
  rentabilidad: number;
}

interface Movement {
  id: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
  kind?: string;
  vertical_id?: string | null;
}

export default function BusinessDashboardPage() {
  const { businessId } = useParams();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    ingresos: 0,
    gastos: 0,
    rentabilidad: 0,
  });
  const [movements, setMovements] = useState<Movement[]>([]);
  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "month" | "year" | "custom">("month");
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: b, error: businessError } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", businessId)
          .single();
          
        if (businessError) {
          console.error("Error cargando negocio:", businessError);
          return;
        }
        
        setBusiness(b);

        let fromDate = new Date();
        if (filter === "today") {
          fromDate = new Date();
          fromDate.setHours(0, 0, 0, 0);
        } else if (filter === "month") {
          fromDate.setMonth(fromDate.getMonth() - 1);
        } else if (filter === "year") {
          fromDate.setFullYear(fromDate.getFullYear() - 1);
        }
        
        const { data: movs, error: movsError } = await supabase
          .from("movements")
          .select("*")
          .eq("business_id", businessId)
          .gte("date", fromDate.toISOString().split("T")[0])
          .order("date", { ascending: false });
        
        if (movsError) {
          console.error("Error cargando movimientos:", movsError);
        }
        
        const allMovements = movs || [];
        setMovements(allMovements);
        
        if (allMovements.length > 0) {
          const ingresos = allMovements
            .filter(m => m.type === "ingreso")
            .reduce((sum, m) => sum + m.amount, 0);
          
          const gastos = allMovements
            .filter(m => m.type === "gasto")
            .reduce((sum, m) => sum + m.amount, 0);
          
          const rentabilidad = gastos > 0 ? Math.round((ingresos - gastos) / gastos * 100) : 0;
          
          setMetrics({
            ingresos,
            gastos,
            rentabilidad
          });
        }
        
        setRecentMovements(allMovements.slice(0, 5));
      } catch (error) {
        console.error("Error general cargando datos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [businessId, filter, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-xl font-semibold text-gray-800">Negocio no encontrado</h2>
        <p className="mt-2 text-gray-600">No pudimos encontrar la información de este negocio.</p>
        <Button 
          className="mt-6"
          onClick={() => router.push('/dashboard')}
        >
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-full overflow-hidden">
      {/* Header - Información del negocio - Más responsive */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white p-4 rounded-lg shadow-sm">
        {business.image_url && (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg flex-shrink-0">
            <Image
              src={business.image_url}
              alt={business.name}
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover"
            />
          </div>
        )}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">{business.name}</h1>
          <div className="text-sm text-gray-600">{business.type}</div>
          {business.description && (
            <div className="mt-1 text-sm text-gray-700 line-clamp-2">{business.description}</div>
          )}
        </div>
      </div>

      {/* Métricas clave - Ahora stack en móvil y grid en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white overflow-hidden">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-medium text-gray-500">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                ${metrics.ingresos.toLocaleString()}
              </span>
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                +20% 
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white overflow-hidden">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-medium text-gray-500">Gastos</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-red-600">
                ${metrics.gastos.toLocaleString()}
              </span>
              <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                +5%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white overflow-hidden sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-medium text-gray-500">Rentabilidad</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className={`text-xl sm:text-2xl font-bold ${metrics.rentabilidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.rentabilidad > 0 ? '+' : ''}{metrics.rentabilidad}%
              </span>
              <div className={`text-xs px-2 py-1 rounded-full ${
                metrics.rentabilidad > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                +2.5%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel principal: gráfico y movimientos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico - ocupa todo el ancho en móvil, 2/3 en desktop */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b">
            <h2 className="font-bold text-lg">Resumen Financiero</h2>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant={filter === "today" ? "default" : "outline"}
                onClick={() => setFilter("today")}
                size="sm"
                className="text-xs flex-1 sm:flex-none"
              >
                Hoy
              </Button>
              <Button
                variant={filter === "month" ? "default" : "outline"}
                onClick={() => setFilter("month")}
                size="sm"
                className="text-xs flex-1 sm:flex-none"
              >
                Mes
              </Button>
              <Button
                variant={filter === "year" ? "default" : "outline"}
                onClick={() => setFilter("year")}
                size="sm"
                className="text-xs flex-1 sm:flex-none"
              >
                Año
              </Button>
            </div>
          </div>
          
          <div className="h-72 sm:h-80 p-4">
            <BusinessChart movements={movements} period={filter} />
          </div>
        </div>
        
        {/* Movimientos recientes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-bold text-lg">Movimientos Recientes</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/business/${businessId}/movements`)}
              className="text-blue-600 hover:text-blue-800 p-0 sm:p-2 flex items-center"
            >
              <span className="hidden sm:inline mr-1">Ver todos</span>
              <ArrowRight size={16} />
            </Button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentMovements.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="mb-2">No hay movimientos registrados</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMoveModalOpen(true)}
                >
                  + Agregar movimiento
                </Button>
              </div>
            ) : (
              <ul>
                {recentMovements.map((mov) => (
                  <li
                    key={mov.id}
                    className="flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                        ${mov.type === "ingreso" ? "bg-green-100" : "bg-red-100"}`}>
                        <span className={`text-sm font-medium
                          ${mov.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                          {mov.type === "ingreso" ? "I" : "G"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {mov.kind || (mov.type === "ingreso" ? "Ingreso" : "Gasto")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(mov.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm sm:text-base font-medium ${mov.type === "ingreso" 
                      ? "text-green-600" 
                      : "text-red-600"}`}>
                      {mov.type === "ingreso" ? "+" : "-"}${Math.abs(mov.amount).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 sm:p-4 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMoveModalOpen(true)} 
              className="w-full flex items-center justify-center text-blue-600"
            >
              <PlusCircle size={16} className="mr-1" />
              <span>Nuevo movimiento</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Botones de acción fijos en la parte inferior en móvil */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-2 justify-around sm:hidden z-10">
        <Button 
          className="flex-1 py-2 text-sm" 
          onClick={() => setMoveModalOpen(true)}
        >
          + Movimiento
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 py-2 text-sm"
          onClick={() => router.push(`/business/${businessId}/inventory`)}
        >
          Inventario
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 py-2 text-sm"
          onClick={() => router.push(`/business/${businessId}/verticals`)}
        >
          Verticales
        </Button>
      </div>

      {/* Botones de acción normales para tablet/desktop */}
      <div className="hidden sm:flex gap-4 mt-2">
        <Button onClick={() => setMoveModalOpen(true)}>
          + Agregar movimiento
        </Button>
        <Button variant="outline" onClick={() => router.push(`/business/${businessId}/inventory`)}>
          Inventario
        </Button>
        <Button variant="outline" onClick={() => router.push(`/business/${businessId}/verticals`)}>
          Verticales
        </Button>
      </div>

      {/* Espacio adicional en móvil para que el contenido no quede detrás de los botones fijos */}
      <div className="h-16 sm:hidden"></div>

      {/* Modal para agregar movimiento */}
      <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Nuevo Movimiento</h2>
        <MovementForm 
          businessId={businessId as string} 
          onComplete={(newMovement) => {
            setMoveModalOpen(false);
            
            if (newMovement) {
              setRecentMovements(prev => [newMovement, ...prev].slice(0, 5));
              
              setMetrics(prev => {
                const newIngresos = newMovement.type === "ingreso" 
                  ? prev.ingresos + newMovement.amount 
                  : prev.ingresos;
                  
                const newGastos = newMovement.type === "gasto" 
                  ? prev.gastos + newMovement.amount 
                  : prev.gastos;
                  
                const newRentabilidad = newGastos > 0 
                  ? Math.round((newIngresos - newGastos) / newGastos * 100) 
                  : 0;
                  
                return {
                  ingresos: newIngresos,
                  gastos: newGastos,
                  rentabilidad: newRentabilidad
                };
              });
              
              setMovements(prev => [newMovement, ...prev]);
            } else {
              setRefreshTrigger(prev => prev + 1);
            }
          }} 
        />
      </Modal>
    </div>
  );
}