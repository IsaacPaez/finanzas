"use client";
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

// Componentes modularizados
import ModalHeader from "./components/ModalHeader";
import StatsSection from "./components/StatsSection";
import CowProductionChart from './components/CowProductionChart';
import CommentsSection from "./components/CommentsSection";
import LoadingSpinner from "./components/LoadingSpinner";

// Hooks personalizados
import { useCowAnalysisData } from "./hooks/useCowAnalysisData";
import { useCowStats } from "./hooks/useCowStats";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CowData {
  id: string;
  name: string;
  production_average?: number;
  last_production?: number;
  trend?: string;
  status?: string;
  comments?: string;
}

interface CowAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  cow: CowData;
  verticalId: string;
  onUpdateCow: (cowId: string, updates: Partial<CowData>) => void;
}

export default function CowAnalysisModal({ 
  isOpen, 
  onClose, 
  cow, 
  verticalId, 
  onUpdateCow 
}: CowAnalysisModalProps) {
  const {
    productionHistory,
    comments,
    setComments,
    loading,
    saving,
    saveComments
  } = useCowAnalysisData(isOpen, cow, verticalId, onUpdateCow);

  const stats = useCowStats(productionHistory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <ModalHeader cow={cow} onClose={onClose} />

        {/* Contenido */}
        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-6">
              {/* Estadísticas */}
              <StatsSection 
                stats={stats} 
                productionHistoryLength={productionHistory.length} 
              />

              {/* Gráfica de producción - ✅ USAR EL NUEVO COMPONENTE */}
              <CowProductionChart 
                productionHistory={productionHistory}
                cowName={cow.name}
              />

              {/* Comentarios */}
              <CommentsSection
                cow={cow}
                comments={comments}
                setComments={setComments}
                saving={saving}
                onSaveComments={saveComments}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}