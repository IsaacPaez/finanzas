interface TabHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabHeader({ activeTab, onTabChange }: TabHeaderProps) {
  const tabs = [
    { id: 'overview', label: 'Vista General' },
    { id: 'edit', label: 'Configuración' },
    { id: 'production', label: 'Producción' }
  ];

  return (
    <div className="flex border-b mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 ${
            activeTab === tab.id 
              ? 'border-b-2 border-blue-500 font-medium' 
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}