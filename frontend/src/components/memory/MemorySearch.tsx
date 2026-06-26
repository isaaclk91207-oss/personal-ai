import { Search } from '../ui/Search';

interface MemorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MemorySearch({ value, onChange }: MemorySearchProps) {
  return <Search value={value} onChange={onChange} placeholder="Search memories..." />;
}
