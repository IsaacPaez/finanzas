import { useCowAnalysis } from "../hooks/useCowAnalysis";
import CowAnalysisModal from "../CowAnalysisModal";

interface CowProductionTableProps {
  schema: any;
  vertical: any;
}

export default function CowProductionTable({ schema, vertical }: CowProductionTableProps) {
  const {
    selectedCow,
    showCowModal,
    cowStats,
    handleCowClick,
    handleUpdateCow,
    closeCowModal
  } = useCowAnalysis(schema);

  return (
    <>
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

      {/* Modal de análisis de vaca */}
      {selectedCow && (
        <CowAnalysisModal
          isOpen={showCowModal}
          onClose={closeCowModal}
          cow={selectedCow}
          verticalId={vertical.id}
          onUpdateCow={handleUpdateCow}
        />
      )}
    </>
  );
}