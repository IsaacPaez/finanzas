import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ProductionChartProps {
  filteredMovements: any[]; // ✅ Debe ser filteredMovements, no movements
  schema: any;
}

export default function ProductionChart({ filteredMovements, schema }: ProductionChartProps) {
  const prepareChartData = () => {
    const data = filteredMovements
      .filter(m => m.type === 'ingreso')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return {
      labels: data.map(m => new Date(m.date).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      })),
      datasets: [
        {
          label: `Producción (${schema.unit})`,
          data: data.map(m => Number(m.production_data?.total_liters || m.production_data?.total_eggs || 0)),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2
        },
        {
          label: 'Ingreso ($)',
          data: data.map(m => Number(m.amount)),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.2,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Producción e Ingresos'
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 border rounded">
      <h4 className="text-sm font-medium mb-2">Gráfico de producción</h4>
      {filteredMovements.length > 1 ? (
        <Line data={prepareChartData()} options={chartOptions} />
      ) : (
        <p className="text-center py-4 text-gray-500">
          Se necesitan al menos 2 registros para mostrar el gráfico
        </p>
      )}
    </div>
  );
}