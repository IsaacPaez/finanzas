import ProductionFilters from "../components/ProductionFilters";
import ProductionChart from "../components/ProductionChart";
import ProductionTable from "../components/ProductionTable";
import { useProductionData } from "../hooks/useProductionData";

interface ProductionTabProps {
  vertical: any;
  schema: any;
  movements: any[];
}

export default function ProductionTab({ vertical, schema, movements }: ProductionTabProps) {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    filteredMovements,
    stats,
    clearFilters
  } = useProductionData(schema, movements, vertical);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Historial de Producción</h3>
      
      <ProductionFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        onClearFilters={clearFilters}
      />
      
      <ProductionChart
        filteredMovements={filteredMovements}
        schema={schema}
      />
      
      <ProductionTable
        filteredMovements={filteredMovements}
        schema={schema}
        stats={stats}
      />
    </div>
  );
}