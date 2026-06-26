import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Dropdown } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { useMemoryStore } from '../../store/memoryStore';

const categoryOptions = [
  { value: 'fact', label: 'Fact' },
  { value: 'preference', label: 'Preference' },
  { value: 'context', label: 'Context' },
  { value: 'personal', label: 'Personal' },
  { value: 'general', label: 'General' },
];

export function EditMemoryModal() {
  const { isEditModalOpen, editingMemory, closeEditModal, updateMemory } = useMemoryStore();
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('fact');

  useEffect(() => {
    if (editingMemory) {
      setType(editingMemory.type);
      setValue(editingMemory.value);
      setCategory(editingMemory.category);
    }
  }, [editingMemory]);

  const handleSave = async () => {
    if (!editingMemory || !value.trim()) return;
    await updateMemory(editingMemory.id, {
      type: type.trim() || editingMemory.type,
      value: value.trim(),
      category,
    });
    closeEditModal();
  };

  return (
    <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Memory" size="md">
      <div className="space-y-4">
        <Input
          label="Memory Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g., Personal, Fact, Context"
        />
        <Textarea
          label="Memory Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What does the AI remember?"
          rows={3}
        />
        <Dropdown
          label="Category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={closeEditModal}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!value.trim()}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
