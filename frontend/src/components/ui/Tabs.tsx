interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-bg-surface-light rounded-xl border border-border-primary">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            transition-all duration-200 ease-out cursor-pointer
            ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-md
                ${activeTab === tab.id ? 'bg-white/20' : 'bg-bg-surface'}
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
