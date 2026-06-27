import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode
} from 'react';

type DatalistFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  /** Sugerencias de autocompletado; el campo sigue aceptando texto libre. */
  options: string[];
};

/**
 * Campo de texto con sugerencias y menú propio (navy + dorado), en lugar del <datalist> nativo
 * que el navegador dibuja sin posibilidad de tematizar. Sigue aceptando texto libre: el menú solo
 * propone coincidencias y se puede ignorar. Accesible: rol combobox/listbox, teclado (flechas,
 * Enter, Esc) y cierre al hacer clic fuera.
 */
export function DatalistField({
  className = '',
  error,
  hint,
  id,
  label,
  leadingIcon,
  options,
  value,
  onChange,
  name,
  onFocus,
  onKeyDown,
  ...props
}: DatalistFieldProps) {
  const reactId = useId();
  const fieldId = id ?? name ?? reactId;
  const listId = `${fieldId}-list`;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const current = value == null ? '' : String(value);
  const q = current.trim().toLowerCase();
  const matches = (q ? options.filter((o) => o.toLowerCase().includes(q)) : options).slice(0, 50);
  // No mostrar el menú si la única coincidencia es exactamente lo ya escrito.
  const showMenu = open && matches.length > 0 && !(matches.length === 1 && matches[0].toLowerCase() === q);

  // Fase de captura: dentro de un Modal el contenedor hace stopPropagation() del mousedown.
  useEffect(() => {
    if (!open) return undefined;
    function onDocPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocPointer, true);
    return () => document.removeEventListener('mousedown', onDocPointer, true);
  }, [open]);

  useEffect(() => {
    if (showMenu && activeIndex >= 0) optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [showMenu, activeIndex]);

  function choose(v: string) {
    onChange?.({ target: { value: v, name } } as unknown as ChangeEvent<HTMLInputElement>);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(e);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (showMenu && activeIndex >= 0 && matches[activeIndex]) {
        e.preventDefault();
        choose(matches[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    }
  }

  return (
    <div className={`hc-field hc-select-field ${className}`.trim()} ref={rootRef}>
      <label className="hc-field-label" htmlFor={fieldId}>
        {label}
      </label>
      <span className={`hc-input-shell ${error ? 'hc-input-error' : ''}`.trim()}>
        {leadingIcon ? <span className="hc-input-icon">{leadingIcon}</span> : null}
        <input
          id={fieldId}
          name={name}
          value={value}
          role="combobox"
          aria-expanded={showMenu}
          aria-controls={showMenu ? listId : undefined}
          aria-activedescendant={showMenu && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          autoComplete="off"
          onChange={(e) => {
            onChange?.(e);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={(e) => {
            onFocus?.(e);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </span>

      {showMenu ? (
        <ul className="hc-select-menu" role="listbox" id={listId}>
          {matches.map((opt, i) => {
            const active = i === activeIndex;
            const chosen = opt.toLowerCase() === q;
            return (
              <li
                key={opt}
                ref={(el) => (optionRefs.current[i] = el)}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={chosen}
                className={`hc-select-option${active ? ' is-active' : ''}${chosen ? ' is-selected' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(opt);
                }}
              >
                <span className="hc-select-option-label">{opt}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {error ? (
        <span className="hc-field-message hc-field-error" id={`${fieldId}-error`}>
          {error}
        </span>
      ) : hint ? (
        <span className="hc-field-message" id={`${fieldId}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
