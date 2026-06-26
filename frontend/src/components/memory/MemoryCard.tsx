import { Edit3, Trash2, Brain, Heart, BookOpen, User } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { MemoryItem } from '../../types';

interface MemoryCardProps {
  memory: MemoryItem;
  onEdit: (memory: MemoryItem) => void;
  onDelete: (id: number) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  fact: BookOpen,
  preference: Heart,
  context: Brain,
  personal: User,
};

const categoryLabels: Record<string, string> = {
  fact: 'Fact',
  preference: 'Preference',
  context: 'Context',
  personal: 'Personal',
  general: 'General',
};

const badgeVariants: Record<string, 'success' | 'warning' | 'primary' | 'default'> = {
  fact: 'success',
  preference: 'warning',
  context: 'primary',
  personal: 'default',
  general: 'default',
};

export function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const Icon = categoryIcons[memory.category] || Brain;
  const badgeVariant = badgeVariants[memory.category] || 'default';
  const date = new Date(memory.createdAt);

  return (
    <div className="group bg-bg-surface border border-border-primary rounded-2xl p-5 hover:border-border-hover hover:bg-bg-surface-hover transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
            <Icon size={18} className="text-primary" />
          </div>
          <div>
            <Badge variant={badgeVariant} size="sm">
              {categoryLabels[memory.category] || memory.type}
            </Badge>
            <p className="text-[10px] text-text-muted mt-1">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(memory)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface-light transition-all cursor-pointer"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-sm text-text-primary leading-relaxed">{memory.value}</p>
    </div>
  );
}
