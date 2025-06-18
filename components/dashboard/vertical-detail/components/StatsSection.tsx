import { TrendingUp } from "lucide-react";

interface StatsSectionProps {
  stats: {
    averageProduction: number;
    lastProduction: number;
    trend: string;
    trendIcon: string;
    trendColor: string;
  };
  productionHistoryLength: number;
}

export default function StatsSection({ stats, productionHistoryLength }: StatsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <TrendingUp size={20} />
        Estadísticas de Producción
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Promedio</p>
          <p className="text-2xl font-bold text-blue-600">
            {stats.averageProduction.toFixed(1)} L
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Última producción</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.lastProduction} L
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total registros</p>
          <p className="text-2xl font-bold text-purple-600">
            {productionHistoryLength}
          </p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Tendencia</p>
          <p className={`text-lg font-bold ${stats.trendColor} flex items-center gap-1`}>
            <span className="text-xl">{stats.trendIcon}</span>
            {stats.trend}
          </p>
        </div>
      </div>
    </div>
  );
}