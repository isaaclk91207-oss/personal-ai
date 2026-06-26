import { Tabs } from '../ui/Tabs';
import { useMemoryStore } from '../../store/memoryStore';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'fact', label: 'Facts' },
  { id: 'preference', label: 'Preferences' },
  { id: 'context', label: 'Context' },
  { id: 'personal', label: 'Personal' },
];

export function MemoryFilters() {
  const { activeCategory, setActiveCategory, memories } = useMemoryStore();

  const tabs = categories.map((cat) => ({
    ...cat,
    count: cat.id === 'all' ? memories.length : memories.filter((m) => m.category === cat.id).length,
  }));

  return <Tabs tabs={tabs} activeTab={activeCategory} onChange={(id) => setActiveCategory(id)} />;
}
