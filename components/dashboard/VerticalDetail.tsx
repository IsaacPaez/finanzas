"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TabHeader from "./vertical-detail/tabs/TabHeader";
import OverviewTab from "./vertical-detail/tabs/OverviewTab";
import ConfigTab from "./vertical-detail/tabs/ConfigTab";
import ProductionTab from "./vertical-detail/tabs/ProductionTab";
import { 
  VerticalSchema, 
  DairyTemplateConfig, 
  EggTemplateConfig,
  Vertical,
  Movement
} from "./vertical-detail/types/interfaces";

interface VerticalDetailProps {
  vertical: Vertical; // ✅ Usar interface tipada
  movements: Movement[]; // ✅ Usar interface tipada
}

export default function VerticalDetail({ vertical, movements }: VerticalDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  
  // Normalizar schema para asegurar que tenga templateConfig con las propiedades correctas
  const [currentSchema, setCurrentSchema] = useState<VerticalSchema | null>(null);
  
  useEffect(() => {
    if (vertical?.variables_schema) {
      const baseSchema = vertical.variables_schema;
      
      if (baseSchema.type === 'dairy') {
        const normalizedSchema = {
          ...baseSchema,
          templateConfig: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            customFields: {},
            trackIndividualProduction: true,
            productionFrequency: 'daily' as const,
            milkingTimes: 2,
            qualityMetrics: false,
            ...baseSchema.templateConfig
          } as DairyTemplateConfig
        };
        setCurrentSchema(normalizedSchema);
      } else if (baseSchema.type === 'eggs') {
        const normalizedSchema = {
          ...baseSchema,
          templateConfig: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            customFields: {},
            trackByType: true,
            eggGradingEnabled: false,
            collectionFrequency: 'daily' as const,
            qualityControl: false,
            ...baseSchema.templateConfig
          } as EggTemplateConfig
        };
        setCurrentSchema(normalizedSchema);
      } else {
        setCurrentSchema(baseSchema);
      }
    }
  }, [vertical]);

  // Renderizar pestaña activa
  const renderActiveTab = () => {
    if (!currentSchema) return <div>Cargando...</div>;

    switch (activeTab) {
      case "overview":
        return <OverviewTab vertical={vertical} schema={currentSchema} movements={movements} />;
      case "edit":
        return <ConfigTab schema={currentSchema} verticalId={vertical.id} loading={false} />;
      case "production":
        return <ProductionTab vertical={vertical} schema={currentSchema} movements={movements} />;
      default:
        return <div>Pestaña no disponible</div>;
    }
  };

  if (!currentSchema) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Cargando configuración...</p>
      </div>
    );
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