import { Movement, VerticalSchema } from "../types/interfaces";

interface ProductionTableProps {
  filteredMovements: Movement[];
  schema: VerticalSchema;
  stats: {
    totalProduction: number;
    totalRevenue: number;
    averagePrice: number;
  };
}

export default function ProductionTable({ filteredMovements, schema, stats }: ProductionTableProps) {
  if (filteredMovements.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No hay producción registrada para esta vertical
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-right">Cantidad</th>
            <th className="p-2 text-right">Precio unitario</th>
            <th className="p-2 text-right">Ingreso</th>
          </tr>
        </thead>
        <tbody>
          {filteredMovements.map((m) => {
            const quantity = (() => {
              if (!m.production_data) return 0;
              if (schema.type === 'dairy') {
                return m.production_data.total_liters || 0;
              } else if (schema.type === 'eggs') {
                return m.production_data.total_eggs || 0;
              }
              return 0;
            })();
            
            const unitPrice = quantity > 0 ? m.amount / quantity : schema.price;
            
            return (
              <tr key={m.id} className="border-t">
                <td className="p-2">
                  {new Date(m.date).toLocaleDateString('es-ES')}
                </td>
                <td className="p-2 text-right">
                  {quantity.toFixed(1)} {schema.unit}
                </td>
                <td className="p-2 text-right">${unitPrice.toFixed(2)}</td>
                <td className="p-2 text-right">${m.amount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td className="p-2 font-medium">Total</td>
            <td className="p-2 text-right font-medium">{stats.totalProduction.toFixed(1)} {schema.unit}</td>
            <td className="p-2 text-right font-medium">${stats.averagePrice.toFixed(2)}</td>
            <td className="p-2 text-right font-medium">${stats.totalRevenue.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}