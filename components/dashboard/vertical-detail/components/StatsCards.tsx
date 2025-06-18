import { useProductionData } from "../hooks/useProductionData";

interface StatsCardsProps {
  schema: any;
  movements: any[];
  vertical: any;
}

export default function StatsCards({ schema, movements, vertical }: StatsCardsProps) {
  const { stats } = useProductionData(schema, movements, vertical);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-sm font-medium text-gray-500">Precio por {schema.unit}</h3>
        <p className="text-2xl font-bold">${schema.price?.toFixed(2)}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-sm font-medium text-gray-500">Producción Total</h3>
        <p className="text-2xl font-bold">{stats.totalProduction.toFixed(1)} {schema.unit}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-sm font-medium text-gray-500">Precio Promedio</h3>
        <p className="text-2xl font-bold">${stats.averagePrice.toFixed(2)}</p>
      </div>
    </div>
  );
}