// Interfaces para los datos de producción
export interface CowInventoryItem {
  id: string;
  name: string;
  notes?: string;
  comments?: string;
  inProduction?: boolean;
}

export interface ProductionRecord {
  id: string;
  date: string;
  liters: number;
  movement_id?: string;
}

export interface CowProductionHistory {
  date: string;
  total_liters: number;
  production: Array<{
    id: string;
    name: string;
    liters: number;
  }>;
  movement_id?: string;
}

// Configuración base del template
export interface BaseTemplateConfig {
  lastUpdated?: string;
  version?: string;
  customFields?: Record<string, unknown>; // ✅ Cambiar any por unknown
}

// Configuración específica para lechería
export interface DairyTemplateConfig extends BaseTemplateConfig {
  trackIndividualProduction?: boolean;
  productionFrequency?: 'daily' | 'weekly' | 'monthly';
  milkingTimes?: number;
  qualityMetrics?: boolean;
}

// Configuración específica para huevos
export interface EggTemplateConfig extends BaseTemplateConfig {
  trackByType?: boolean;
  eggGradingEnabled?: boolean;
  collectionFrequency?: 'daily' | 'twice-daily' | 'custom';
  qualityControl?: boolean;
}

export interface DairySchema {
  type: 'dairy';
  price: number;
  unit: string;
  templateConfig: DairyTemplateConfig;
  inventory?: {
    items: CowInventoryItem[];
  };
  cowProductionHistory?: CowProductionHistory[];
}

export interface EggProductionType {
  id: string;
  name: string;
  price: number;
  active: boolean;
  description?: string;
}

export interface EggSchema {
  type: 'eggs';
  price: number;
  unit: string;
  templateConfig: EggTemplateConfig;
  inventory?: {
    total: number;
  };
  productionTypes?: EggProductionType[];
  eggProductionHistory?: Array<{
    date: string;
    total_eggs: number;
    movement_id?: string;
  }>;
}

export type VerticalSchema = DairySchema | EggSchema;

export interface Vertical {
  id: string;
  name: string;
  description?: string;
  variables_schema: VerticalSchema;
}

export interface MovementProductionData {
  total_liters?: number;
  total_eggs?: number;
}

export interface Movement {
  id: string;
  date: string;
  type: 'ingreso' | 'gasto';
  amount: number;
  vertical_id: string;
  production_data?: MovementProductionData;
  description?: string;
}

export interface CowStats {
  id: string;
  name: string;
  inProduction: boolean;
  totalLiters: number;
  count: number;
  records: ProductionRecord[];
  avgProduction: number;
  lastProduction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  comments?: string;
}

export interface CowData {
  id: string;
  name: string;
  production_average?: number;
  last_production?: number;
  trend?: string;
  status?: string;
  comments?: string;
}