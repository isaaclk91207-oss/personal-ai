import { Search as SearchIcon, X } from 'lucide-react';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Search({ value, onChange, placeholder = 'Search...' }: SearchProps) {
  return (
    <div className="relative w-full">
      <SearchIcon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-input border border-border-primary rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-glow-primary"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
