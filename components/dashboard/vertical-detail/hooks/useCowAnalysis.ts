import { useState, useMemo } from "react";

interface CowData {
  id: string;
  name: string;
  production_average?: number;
  last_production?: number;
  trend?: string;
  status?: string;
  comments?: string;
}

export const useCowAnalysis = (schema: any) => {
  const [selectedCow, setSelectedCow] = useState<CowData | null>(null);
  const [showCowModal, setShowCowModal] = useState(false);

  // Función para calcular tendencia
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length/2));
    const secondHalf = values.slice(Math.floor(values.length/2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    if (diff > 0.5) return 'increasing';
    if (diff < -0.5) return 'decreasing';
    return 'stable';
  };

  // Calcular datos de producción para cada vaca
  const cowStats = useMemo(() => {
    if (schema.type !== "dairy" || !schema.cowProductionHistory?.length) {
      return [];
    }
    
    const cowStatsMap = new Map();
    
    schema.cowProductionHistory.forEach((record: any) => {
      if (!record.production) return;
      
      record.production.forEach((cow: any) => {
        if (!cowStatsMap.has(cow.id)) {
          const cowInfo = schema.inventory?.items?.find((c: any) => c.id === cow.id) || { name: cow.name };
          
          cowStatsMap.set(cow.id, { 
            id: cow.id,
            name: cow.name || cowInfo.name, 
            inProduction: cowInfo.inProduction !== false,
            totalLiters: 0, 
            count: 0,
            records: [],
            comments: cowInfo.comments || ""
          });
        }
        
        const stats = cowStatsMap.get(cow.id);
        stats.totalLiters += Number(cow.liters || 0);
        stats.count++;
        stats.records.push({
          date: record.date,
          liters: Number(cow.liters || 0)
        });
      });
    });
    
    return Array.from(cowStatsMap.values())
      .map(cow => ({
        ...cow,
        avgProduction: cow.count > 0 ? cow.totalLiters / cow.count : 0,
        lastProduction: cow.records.length > 0 ? 
          cow.records.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0]?.liters || 0 : 0,
        trend: cow.records.length > 1 ? 
          calculateTrend(cow.records.map((r: any) => r.liters).slice(-7)) : 'stable'
      }))
      .sort((a, b) => b.avgProduction - a.avgProduction);
  }, [schema]);

  const handleCowClick = (cow: any) => {
    const cowData: CowData = {
      id: cow.id,
      name: cow.name,
      production_average: cow.avgProduction,
      last_production: cow.lastProduction,
      trend: cow.trend,
      status: cow.inProduction ? 'active' : 'inactive',
      comments: cow.comments || ""
    };
    
    setSelectedCow(cowData);
    setShowCowModal(true);
  };

  const handleUpdateCow = (cowId: string, updates: Partial<CowData>) => {
    console.log("Actualizando vaca:", cowId, updates);
  };

  const closeCowModal = () => {
    setShowCowModal(false);
    setSelectedCow(null);
  };

  return {
    selectedCow,
    showCowModal,
    cowStats,
    handleCowClick,
    handleUpdateCow,
    closeCowModal
  };
};