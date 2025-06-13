"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
  produccion: number;
  gastos: number;
  rentabilidad: number;
}

interface Movement {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export default function BusinessDashboardPage() {
  const { businessId } = useParams();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    ingresos: 0,
    produccion: 0,
    gastos: 0,
    rentabilidad: 0,
  });
  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "month" | "custom">("month");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      const { data: b } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();
      setBusiness(b);

      // Mock de métricas; reemplazar por consulta real
      setMetrics({
        ingresos: 1200000,
        produccion: 500,
        gastos: 800000,
        rentabilidad: 33.3,
      });

      const { data: m } = await supabase
        .from("movements")
        .select("*")
        .eq("business_id", businessId)
        .order("date", { ascending: false })
        .limit(5);
      setRecentMovements(m || []);
      setLoading(false);
    }
    fetchData();
  }, [businessId, filter]);

  if (loading) return <div>Cargando...</div>;
  if (!business) return <div>No se encontró el negocio.</div>;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        {business.image_url && (
          <Image
            src={business.image_url}
            alt={business.name}
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <div className="text-muted-foreground">{business.type}</div>
          <div>{business.description}</div>
        </div>
      </div>

      {/* Métricas clave */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">
              ${metrics.ingresos.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Producción</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {metrics.produccion} {business.unit || "unidades"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-red-600">
              ${metrics.gastos.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {metrics.rentabilidad}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico resumen */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Resumen de movimientos</h2>
          <div className="flex gap-2">
            <Button
              variant={filter === "today" ? "default" : "outline"}
              onClick={() => setFilter("today")}
            >
              Hoy
            </Button>
            <Button
              variant={filter === "month" ? "default" : "outline"}
              onClick={() => setFilter("month")}
            >
              Último mes
            </Button>
            <Button
              variant={filter === "custom" ? "default" : "outline"}
              onClick={() => setFilter("custom")}
            >
              Personalizado
            </Button>
          </div>
        </div>
        {/* Aquí va el componente de gráfico */}
        {/* <LineChart data={...} /> */}
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          [Gráfico aquí]
        </div>
      </div>

      {/* Movimientos recientes */}
      <div>
        <h2 className="font-bold mb-2">Movimientos recientes</h2>
        <div className="bg-white rounded-lg shadow">
          <ul>
            {recentMovements.map((mov) => (
              <li
                key={mov.id}
                className="flex justify-between items-center border-b last:border-b-0 px-4 py-2"
              >
                <span>{new Date(mov.date).toLocaleDateString()}</span>
                <span>{mov.description}</span>
                <span
                  className={
                    mov.amount >= 0
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {mov.amount >= 0 ? "+" : "-"}${Math.abs(mov.amount).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button onClick={() => router.push(`/business/${businessId}/movements`)}>
          + Agregar movimiento
        </Button>
        <Button variant="outline" onClick={() => router.push(`/business/${businessId}/inventory`)}>
          Inventario
        </Button>
        <Button variant="outline" onClick={() => router.push(`/business/${businessId}/verticals`)}>
          Verticales
        </Button>
      </div>
    </div>
  );
}