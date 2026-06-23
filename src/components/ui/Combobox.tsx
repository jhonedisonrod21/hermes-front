import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export type ComboboxOption = { value: string; label: string; sublabel?: string };

type ComboboxProps = {
  label: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  emptyText?: string;
  /** Texto del botón para limpiar la selección (accesibilidad). */
  clearLabel?: string;
};

/** Selector con búsqueda: filtra opciones por etiqueta/subetiqueta y muestra la elegida como chip. */
export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder,
  hint,
  error,
  emptyText,
  clearLabel
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  if (selected) {
    return (
      <div className="hc-field">
        <span className="hc-field-label">{label}</span>
        <div className="hc-combobox-selected">
          <div>
            <strong>{selected.label}</strong>
            {selected.sublabel ? <span>{selected.sublabel}</span> : null}
          </div>
          <button
            type="button"
            className="hc-icon-button"
            aria-label={clearLabel ?? 'Clear'}
            onClick={() => {
              onChange('');
              setQuery('');
            }}
          >
            <X size={16} />
          </button>
        </div>
        {hint ? <span className="hc-field-message">{hint}</span> : null}
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = (q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || (o.sublabel ?? '').toLowerCase().includes(q))
    : options
  ).slice(0, 50);

  return (
    <div className="hc-field hc-combobox" ref={ref}>
      <span className="hc-field-label">{label}</span>
      <span className={`hc-input-shell ${error ? 'hc-input-error' : ''}`.trim()}>
        <span className="hc-input-icon">
          <Search size={18} />
        </span>
        <input
          value={query}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </span>
      {open ? (
        <div className="hc-combobox-list" role="listbox">
          {filtered.length ? (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                className="hc-combobox-option"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(o.value);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <strong>{o.label}</strong>
                {o.sublabel ? <span>{o.sublabel}</span> : null}
              </button>
            ))
          ) : (
            <div className="hc-combobox-empty">{emptyText}</div>
          )}
        </div>
      ) : null}
      {error ? (
        <span className="hc-field-message hc-field-error">{error}</span>
      ) : hint ? (
        <span className="hc-field-message">{hint}</span>
      ) : null}
    </div>
  );
}
