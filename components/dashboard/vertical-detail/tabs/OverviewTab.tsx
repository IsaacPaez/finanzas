import { useCowAnalysis } from "../hooks/useCowAnalysis";
import CowAnalysisModal from "../CowAnalysisModal";

interface OverviewTabProps {
  vertical: any;
  schema: any;
  movements: any[];
}

export default function OverviewTab({ vertical, schema, movements }: OverviewTabProps) {
  const {
    selectedCow,
    showCowModal,
    cowStats,
    handleCowClick,
    handleUpdateCow,
    closeCowModal
  } = useCowAnalysis(schema);

  // Calcular estadísticas básicas
  const calculateTotalProduction = () => {
    if (schema.type === "dairy" && schema.cowProductionHistory && schema.cowProductionHistory.length > 0) {
      return schema.cowProductionHistory.reduce((sum: number, record: any) => {
        return sum + Number(record.total_liters || 0);
      }, 0);
    } else if (schema.type === "eggs" && schema.eggProductionHistory && schema.eggProductionHistory.length > 0) {
      return schema.eggProductionHistory.reduce((sum: number, record: any) => {
        return sum + Number(record.total_eggs || 0);
      }, 0);
    }
    return 0;
  };

  const totalProduction = calculateTotalProduction();
  const totalRevenue = movements
    .filter(m => m.vertical_id === vertical.id)
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const averagePrice = totalProduction > 0 ? totalRevenue / totalProduction : schema.price || 0;

  return (
    <div className="space-y-4">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Precio por {schema.unit}</h3>
          <p className="text-2xl font-bold">${schema.price?.toFixed(2)}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Producción Total</h3>
          <p className="text-2xl font-bold">{totalProduction.toFixed(1)} {schema.unit}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Precio Promedio</h3>
          <p className="text-2xl font-bold">${averagePrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabla de producción por vaca (solo para dairy) */}
      {schema.type === "dairy" && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-base font-medium mb-2">Producción por Vaca</h3>
          
          {cowStats.length > 0 ? (
            <div className="overflow-hidden rounded border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaca
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tendencia
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cowStats.map((cow: any) => (
                    <tr key={cow.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600">{cow.name.charAt(0)}</span>
                          </div>
                          {cow.name}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {cow.avgProduction.toFixed(1)} L
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        <span className="font-medium">{cow.lastProduction.toFixed(1)} L</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                        <span className={`text-lg ${
                          cow.trend === 'increasing' ? 'text-green-600' : 
                          cow.trend === 'decreasing' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {cow.trend === 'increasing' && '↗️'}
                          {cow.trend === 'decreasing' && '↘️'}
                          {cow.trend === 'stable' && '➡️'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          cow.inProduction ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {cow.inProduction ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleCowClick(cow)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                        >
                          Ver análisis
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No hay datos de producción disponibles</p>
          )}
        </div>
      )}

      {/* Tabla de tipos de huevos (solo para eggs) */}
      {schema.type === "eggs" && schema.productionTypes && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-base font-medium mb-2">Tipos de Huevos</h3>
          <div className="overflow-hidden rounded border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schema.productionTypes.map((type: any) => (
                  <tr key={type.id}>
                    <td className="px-3 py-2 text-sm font-medium">{type.name}</td>
                    <td className="px-3 py-2 text-sm text-right">${type.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        type.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {type.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de análisis de vaca */}
      {selectedCow && schema.type === "dairy" && (
        <CowAnalysisModal
          isOpen={showCowModal}
          onClose={closeCowModal}
          cow={selectedCow}
          verticalId={vertical.id}
          onUpdateCow={handleUpdateCow}
        />
      )}
    </div>
  );
}