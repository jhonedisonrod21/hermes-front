import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function SearchInput({ className = '', ...props }: SearchInputProps) {
  return (
    <span className={`hc-input-shell hc-search ${className}`.trim()}>
      <span className="hc-input-icon">
        <Search size={18} />
      </span>
      <input type="search" {...props} />
    </span>
  );
}
