interface ProductionRecord {
  date: string;
  liters: number;
  movement_id?: string;
}

export const useCowStats = (productionHistory: ProductionRecord[]) => {
  const calculateStats = () => {
    if (productionHistory.length === 0) {
      return {
        totalProduction: 0,
        averageProduction: 0,
        lastProduction: 0,
        trend: "Sin datos",
        trendIcon: "➡️",
        trendColor: "text-gray-600"
      };
    }

    const totalProduction = productionHistory.reduce((sum, record) => sum + record.liters, 0);
    const averageProduction = totalProduction / productionHistory.length;
    const lastProduction = productionHistory[productionHistory.length - 1].liters;
    
    let trend = "Estable";
    let trendIcon = "➡️";
    let trendColor = "text-gray-600";
    
    if (productionHistory.length >= 2) {
      const secondLastProduction = productionHistory[productionHistory.length - 2].liters;
      
      if (lastProduction > secondLastProduction) {
        trend = "Aumentando";
        trendIcon = "↗️";
        trendColor = "text-green-600";
      } else if (lastProduction < secondLastProduction) {
        trend = "Disminuyendo";
        trendIcon = "↘️";
        trendColor = "text-red-600";
      }
    }

    return {
      totalProduction,
      averageProduction,
      lastProduction,
      trend,
      trendIcon,
      trendColor
    };
  };

  return calculateStats();
};