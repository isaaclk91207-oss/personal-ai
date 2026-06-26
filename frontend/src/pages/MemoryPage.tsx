import { useEffect } from 'react';
import { MemorySearch } from '../components/memory/MemorySearch';
import { MemoryFilters } from '../components/memory/MemoryFilters';
import { MemoryCard } from '../components/memory/MemoryCard';
import { EditMemoryModal } from '../components/memory/EditMemoryModal';
import { EmptyMemory } from '../components/memory/EmptyMemory';
import { useMemoryStore } from '../store/memoryStore';
import { useToastStore } from '../store/toastStore';

export function MemoryPage() {
  const {
    searchQuery,
    setSearchQuery,
    getFilteredMemories,
    openEditModal,
    deleteMemory,
    loadMemories,
  } = useMemoryStore();

  const { addToast } = useToastStore();
  const filteredMemories = getFilteredMemories();

  useEffect(() => {
    loadMemories();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteMemory(id);
    addToast({
      type: 'success',
      title: 'Memory deleted',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-6 py-6 border-b border-border-primary">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold text-text-primary">Memories</h1>
            <span className="text-sm text-text-muted mt-1">
              {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <MemorySearch value={searchQuery} onChange={setSearchQuery} />
            </div>
            <MemoryFilters />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {filteredMemories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMemories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyMemory />
          )}
        </div>
      </div>

      <EditMemoryModal />
    </div>
  );
}
