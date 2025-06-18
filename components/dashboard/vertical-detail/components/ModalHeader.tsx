import { X } from "lucide-react";

interface ModalHeaderProps {
  cow: {
    name: string;
  };
  onClose: () => void;
}

export default function ModalHeader({ cow, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-blue-600">{cow.name}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Análisis de {cow.name}</h2>
          <p className="text-gray-500">Historial y métricas de producción</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
}