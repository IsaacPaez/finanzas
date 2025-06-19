import { useState, useMemo } from "react"; // ✅ Removido useEffect
import { VerticalSchema, Movement, Vertical } from "../types/interfaces";

interface ProductionStats {
  totalProduction: number;
  totalRevenue: number;
  averagePrice: number;
}

export function useProductionData(
  schema: VerticalSchema, 
  movements: Movement[], 
  vertical: Vertical
) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Filtrar movimientos de producción para esta vertical
  const productionMovements = useMemo(() => {
    return movements.filter(m => 
      m.vertical_id === vertical.id && 
      m.type === 'ingreso' && 
      m.production_data
    );
  }, [movements, vertical.id]);

  // Aplicar filtros
  const filteredMovements = useMemo(() => {
    let filtered = [...productionMovements];

    if (startDate) {
      filtered = filtered.filter(m => new Date(m.date) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(m => new Date(m.date) <= new Date(endDate));
    }

    if (minPrice) {
      const minPriceNum = Number(minPrice);
      filtered = filtered.filter(m => {
        const quantity = getQuantityFromMovement(m, schema);
        const unitPrice = quantity > 0 ? m.amount / quantity : 0;
        return unitPrice >= minPriceNum;
      });
    }

    if (maxPrice) {
      const maxPriceNum = Number(maxPrice);
      filtered = filtered.filter(m => {
        const quantity = getQuantityFromMovement(m, schema);
        const unitPrice = quantity > 0 ? m.amount / quantity : 0;
        return unitPrice <= maxPriceNum;
      });
    }

    return filtered;
  }, [productionMovements, startDate, endDate, minPrice, maxPrice, schema]);

  // Calcular estadísticas
  const stats = useMemo((): ProductionStats => {
    const totalProduction = filteredMovements.reduce((sum, m) => {
      return sum + getQuantityFromMovement(m, schema);
    }, 0);

    const totalRevenue = filteredMovements.reduce((sum, m) => {
      return sum + Number(m.amount || 0);
    }, 0);

    const averagePrice = totalProduction > 0 ? totalRevenue / totalProduction : schema.price || 0;

    return {
      totalProduction,
      totalRevenue,
      averagePrice
    };
  }, [filteredMovements, schema]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setMinPrice("");
    setMaxPrice("");
  };

  return {
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
  };
}

// Helper function para extraer cantidad según el tipo de schema
function getQuantityFromMovement(movement: Movement, schema: VerticalSchema): number {
  if (!movement.production_data) return 0;
  
  if (schema.type === 'dairy') {
    return movement.production_data.total_liters || 0;
  } else if (schema.type === 'eggs') {
    return movement.production_data.total_eggs || 0;
  }
  
  return 0;
}