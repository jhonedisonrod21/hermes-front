import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
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
  /** Aviso cuando hay más coincidencias de las que se muestran (refina la búsqueda). */
  moreText?: string;
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
  clearLabel,
  moreText
}: Readonly<ComboboxProps>) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    // Captura: dentro de un Modal el contenedor hace stopPropagation() del mousedown.
    document.addEventListener('mousedown', onDocClick, true);
    return () => document.removeEventListener('mousedown', onDocClick, true);
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
  const matched = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || (o.sublabel ?? '').toLowerCase().includes(q))
    : options;
  const filtered = matched.slice(0, 50);
  const truncated = matched.length > filtered.length;

  function choose(o: ComboboxOption) {
    onChange(o.value);
    setOpen(false);
    setQuery('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && filtered[activeIndex]) {
        e.preventDefault();
        choose(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

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
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </span>
      {open ? (
        <div className="hc-combobox-list" role="listbox" id={listId}>
          {filtered.length ? (
            <>
              {filtered.map((o, i) => (
                <button
                  key={o.value}
                  id={`${listId}-${i}`}
                  type="button"
                  className={`hc-combobox-option${i === activeIndex ? ' is-active' : ''}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(o);
                  }}
                >
                  <strong>{o.label}</strong>
                  {o.sublabel ? <span>{o.sublabel}</span> : null}
                </button>
              ))}
              {truncated && moreText ? <div className="hc-combobox-more">{moreText}</div> : null}
            </>
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
