import { useState, useMemo } from "react";

export const useProductionData = (schema: any, movements: any[], vertical: any) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Filtrar movimientos según los criterios
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      // Solo ingresos
      if (m.type !== 'ingreso') return false;
      
      // Filtro de fecha
      if (startDate && new Date(m.date) < new Date(startDate)) return false;
      if (endDate && new Date(m.date) > new Date(endDate)) return false;
      
      // Filtro de precio
      if (minPrice && m.amount < Number(minPrice)) return false;
      if (maxPrice && m.amount > Number(maxPrice)) return false;
      
      return true;
    });
  }, [movements, startDate, endDate, minPrice, maxPrice]);

  // Calcular estadísticas básicas
  const stats = useMemo(() => {
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
    const totalRevenue = filteredMovements
      .filter(m => m.vertical_id === vertical.id)
      .reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const averagePrice = totalProduction > 0 ? totalRevenue / totalProduction : schema.price || 0;

    return {
      totalProduction,
      totalRevenue,
      averagePrice
    };
  }, [schema, filteredMovements, vertical.id]);

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
};