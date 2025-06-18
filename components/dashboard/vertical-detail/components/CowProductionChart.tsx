import { Line } from "react-chartjs-2";
import { Calendar } from "lucide-react";

interface ProductionRecord {
  date: string;
  liters: number;
  movement_id?: string;
}

interface CowProductionChartProps {
  productionHistory: ProductionRecord[];
  cowName: string;
}

export default function CowProductionChart({ productionHistory, cowName }: CowProductionChartProps) {
  const chartData = {
    labels: productionHistory.map(record => 
      new Date(record.date).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'Producción (Litros)',
        data: productionHistory.map(record => record.liters),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Historial de Producción - ${cowName}`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Litros'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      }
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Calendar size={20} />
        Historial de Producción
      </h3>
      
      {productionHistory.length > 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg" style={{ height: '400px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No hay registros de producción disponibles</p>
          <p className="text-sm text-gray-400 mt-1">
            Los datos aparecerán cuando registres movimientos de producción
          </p>
        </div>
      )}
    </div>
  );
}