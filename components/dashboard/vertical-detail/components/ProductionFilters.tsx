interface ProductionFiltersProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  onClearFilters: () => void;
}

export default function ProductionFilters({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onClearFilters
}: ProductionFiltersProps) {
  return (
    <div className="bg-gray-50 p-4 rounded mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Fecha desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Fecha hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Rango de precio</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border rounded p-2"
              min="0"
            />
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border rounded p-2"
              min="0"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex justify-end">
        <button
          onClick={onClearFilters}
          className="px-3 py-1 border rounded mr-2"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}