"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TabHeader from "./vertical-detail/tabs/TabHeader";
import OverviewTab from "./vertical-detail/tabs/OverviewTab";
import ConfigTab from "./vertical-detail/tabs/ConfigTab";
import ProductionTab from "./vertical-detail/tabs/ProductionTab";
import { useVerticalData } from "./vertical-detail/hooks/useVerticalData";

interface VerticalDetailProps {
  vertical: any;
  movements: any[];
  businessId: string;
}

export default function VerticalDetail({ vertical, movements, businessId }: VerticalDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const { schema, loading, handleSaveChanges } = useVerticalData(vertical);
  
  // Actualizar schema cuando cambie el vertical (por ejemplo, después de guardar)
  const [currentSchema, setCurrentSchema] = useState(schema);
  
  useEffect(() => {
    setCurrentSchema(vertical?.variables_schema || {});
  }, [vertical]);

  // Renderizar pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab vertical={vertical} schema={currentSchema} movements={movements} />;
      case "edit":
        return <ConfigTab schema={currentSchema} verticalId={vertical.id} loading={loading} />;
      case "production":
        return <ProductionTab vertical={vertical} schema={currentSchema} movements={movements} />;
      default:
        return <div>Pestaña no disponible</div>;
    }
  };

  if (!currentSchema) {
    return <div className="text-center p-8">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{vertical.name}</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            Volver
          </button>
        </div>
        <p className="text-gray-500">{vertical.description || "Sin descripción"}</p>
      </div>

      <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-4">{renderActiveTab()}</div>
    </div>
  );
}