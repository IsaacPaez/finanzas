"use client";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Movement {
  id: string;
  date: string;
  type: "ingreso" | "gasto";
  amount: number;
}

interface ChartProps {
  movements: Movement[];
  period: "today" | "month" | "year" | "custom";
}

type ChartType = "bar" | "line" | "area";

// Nombre de meses abreviados
const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function BusinessChart({ movements, period }: ChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");

  // Procesamos los datos para el gráfico
  const chartData = useMemo(() => {
    try {
      // Verificar que movements sea un array
      if (!Array.isArray(movements)) {
        console.error("Los movimientos no son un array válido:", movements);
        return [];
      }

      // Filtramos los movimientos según el periodo seleccionado
      let filteredMovements = movements;
      
      // Aplicamos filtros adicionales según el periodo seleccionado
      if (period === "today") {
        const today = new Date().toISOString().split('T')[0];
        filteredMovements = movements.filter(mov => mov.date === today);
      }
      // Para otros periodos, los datos ya vienen filtrados desde el componente padre

      // Filtrar solo los elementos que tengan fecha y monto válido
      const validMovements = filteredMovements.filter(mov => 
        mov && mov.date && !isNaN(new Date(mov.date).getTime()) && 
        typeof mov.amount === 'number' && !isNaN(mov.amount)
      );

      // Agrupar movimientos por mes
      const groupedByMonth = validMovements.reduce((acc, movement) => {
        const date = new Date(movement.date);
        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${year}-${month}`;

        if (!acc[key]) {
          acc[key] = {
            month,
            year,
            ingresos: 0,
            gastos: 0,
          };
        }

        if (movement.type === "ingreso") {
          acc[key].ingresos += movement.amount;
        } else {
          acc[key].gastos += movement.amount;
        }

        return acc;
      }, {} as Record<string, { month: number; year: number; ingresos: number; gastos: number }>);

      // Convertir a array y ordenar por fecha
      return Object.values(groupedByMonth)
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        })
        .map((item) => ({
          name: monthNames[item.month],
          ingresos: item.ingresos,
          gastos: item.gastos,
          balance: item.ingresos - item.gastos,
        }));
    } catch (error) {
      console.error("Error procesando datos para el gráfico:", error);
      return [];
    }
  }, [movements, period]); // Añadimos period como dependencia

  // Formato para los valores monetarios
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Si no hay datos suficientes, mostramos un mensaje
  if (chartData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p className="mb-4">No hay suficientes datos para generar un gráfico</p>
        <p className="text-sm">Agrega movimientos para visualizar estadísticas</p>
      </div>
    );
  }

  // Selector de tipo de gráfico
  const renderChartTypeSelector = () => (
    <div className="mb-4 flex justify-center space-x-4">
      <button
        onClick={() => setChartType("bar")}
        className={`px-3 py-1 rounded-full text-sm ${
          chartType === "bar" 
            ? "bg-blue-100 text-blue-700" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Barras
      </button>
      <button
        onClick={() => setChartType("line")}
        className={`px-3 py-1 rounded-full text-sm ${
          chartType === "line" 
            ? "bg-blue-100 text-blue-700" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Líneas
      </button>
      <button
        onClick={() => setChartType("area")}
        className={`px-3 py-1 rounded-full text-sm ${
          chartType === "area" 
            ? "bg-blue-100 text-blue-700" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Área
      </button>
    </div>
  );

  // Renderizar el tipo de gráfico seleccionado
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const axisProps = {
      xAxis: <XAxis dataKey="name" />,
      yAxis: <YAxis tickFormatter={formatCurrency} width={80} />,
      cartesian: <CartesianGrid strokeDasharray="3 3" vertical={false} />,
      tooltip: (
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
          labelFormatter={(label) => `Mes: ${label}`}
        />
      ),
      legend: <Legend />,
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {axisProps.cartesian}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Line
              type="monotone"
              dataKey="ingresos"
              name="Ingresos"
              stroke="#38A169"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="gastos"
              name="Gastos"
              stroke="#E53E3E"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {axisProps.cartesian}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Area
              type="monotone"
              dataKey="ingresos"
              name="Ingresos"
              fill="#38A16933"
              stroke="#38A169"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="gastos"
              name="Gastos"
              fill="#E53E3E33"
              stroke="#E53E3E"
              strokeWidth={2}
            />
          </AreaChart>
        );

      case "bar":
      default:
        return (
          <BarChart {...commonProps}>
            {axisProps.cartesian}
            {axisProps.xAxis}
            {axisProps.yAxis}
            {axisProps.tooltip}
            {axisProps.legend}
            <Bar
              dataKey="ingresos"
              name="Ingresos"
              fill="#38A169"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="gastos"
              name="Gastos"
              fill="#E53E3E"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {renderChartTypeSelector()}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}