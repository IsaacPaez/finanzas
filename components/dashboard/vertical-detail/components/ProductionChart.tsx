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
import { Movement, VerticalSchema } from "../types/interfaces";

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
  filteredMovements: Movement[];
  schema: VerticalSchema;
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
          data: data.map(m => {
            const productionData = m.production_data;
            if (!productionData) return 0;
            
            // Usar el tipo correcto según el schema
            if (schema.type === 'dairy') {
              return Number(productionData.total_liters || 0);
            } else if (schema.type === 'eggs') {
              return Number(productionData.total_eggs || 0);
            }
            return 0;
          }),
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
        title: {
          display: true,
          text: `Producción (${schema.unit})`
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Ingreso ($)'
        },
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
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500 text-sm">
            Se necesitan al menos 2 registros para mostrar el gráfico
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Registros actuales: {filteredMovements.length}
          </p>
        </div>
      )}
    </div>
  );
}