import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type SelectHTMLAttributes
} from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type SelectOption = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

/**
 * Lista desplegable con apariencia propia (navy + dorado), en lugar del popup nativo del
 * navegador que no se puede tematizar. Mantiene la API del antiguo <select> (value + onChange
 * con e.target.value), por lo que los formularios existentes no cambian. Accesible: rol
 * listbox/option, navegación con teclado (flechas, Inicio/Fin, Enter, Esc) y type-ahead.
 */
export function Select({
  className = '',
  error,
  hint,
  id,
  label,
  options,
  placeholder,
  value,
  onChange,
  disabled,
  name,
  title,
  'aria-label': ariaLabel
}: SelectProps) {
  const reactId = useId();
  const fieldId = id ?? name ?? reactId;
  const labelId = `${fieldId}-label`;
  const listId = `${fieldId}-list`;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  const items: SelectOption[] =
    placeholder !== undefined ? [{ value: '', label: placeholder }, ...options] : options;
  const current = value == null ? '' : String(value);
  const selected = items.find((o) => o.value === current);
  const isPlaceholder = current === '' && placeholder !== undefined;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const typeahead = useRef<{ buffer: string; timer: number }>({ buffer: '', timer: 0 });

  // Cierra al hacer clic fuera. En fase de captura: dentro de un Modal el contenedor hace
  // stopPropagation() del mousedown, así que un listener en burbujeo nunca se enteraría.
  useEffect(() => {
    if (!open) return undefined;
    function onDocPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocPointer, true);
    return () => document.removeEventListener('mousedown', onDocPointer, true);
  }, [open]);

  // Mantiene visible la opción activa.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function emit(v: string) {
    onChange?.({ target: { value: v, name } } as unknown as ChangeEvent<HTMLSelectElement>);
  }

  function openMenu() {
    if (disabled) return;
    const i = items.findIndex((o) => o.value === current);
    setActiveIndex(i < 0 ? 0 : i);
    setOpen(true);
  }

  function choose(index: number) {
    const opt = items[index];
    if (!opt) return;
    if (opt.value !== current) emit(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Type-ahead: salta a la opción que empieza por las letras tecleadas.
  // El buffer se acumula y se reinicia 700 ms tras la última tecla. Para un prefijo de varias
  // letras se busca desde el inicio; para una sola letra, cíclicamente desde la opción actual.
  function typeaheadJump(key: string) {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.buffer += key;
    state.timer = window.setTimeout(() => {
      state.buffer = '';
    }, 700);
    const q = state.buffer.toLowerCase();
    const base = open ? activeIndex : items.findIndex((o) => o.value === current);
    const start = q.length > 1 ? 0 : base + 1;
    const order = items.map((_, i) => (start + i) % items.length);
    const hit = order.find((i) => items[i].label.toLowerCase().startsWith(q));
    if (hit != null) {
      if (open) setActiveIndex(hit);
      else choose(hit);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) return openMenu();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return openMenu();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Home') {
      if (open) {
        e.preventDefault();
        setActiveIndex(0);
      }
    } else if (e.key === 'End') {
      if (open) {
        e.preventDefault();
        setActiveIndex(items.length - 1);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) choose(activeIndex);
      else openMenu();
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      typeaheadJump(e.key);
    }
  }

  return (
    <div className={`hc-field hc-select-field ${className}`.trim()} ref={rootRef}>
      {label ? (
        <span className="hc-field-label" id={labelId}>
          {label}
        </span>
      ) : null}
      <span className={`hc-input-shell ${error ? 'hc-input-error' : ''}`.trim()}>
        <button
          type="button"
          ref={triggerRef}
          id={fieldId}
          className={`hc-select hc-select-trigger${isPlaceholder ? ' is-placeholder' : ''}`}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={label ? `${labelId} ${fieldId}` : undefined}
          aria-label={!label ? ariaLabel : undefined}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          title={title}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onKeyDown}
        >
          <span className="hc-select-value">{selected ? selected.label : placeholder ?? ''}</span>
          <ChevronDown size={16} className="hc-select-caret" aria-hidden="true" />
        </button>
      </span>

      {open ? (
        <ul className="hc-select-menu" role="listbox" id={listId} aria-labelledby={label ? labelId : undefined}>
          {items.map((opt, i) => {
            const active = i === activeIndex;
            const chosen = opt.value === current;
            return (
              <li
                key={opt.value || `__ph-${i}`}
                ref={(el) => (optionRefs.current[i] = el)}
                role="option"
                aria-selected={chosen}
                className={`hc-select-option${active ? ' is-active' : ''}${chosen ? ' is-selected' : ''}${
                  opt.value === '' && placeholder !== undefined ? ' is-placeholder' : ''
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(i);
                }}
              >
                <span className="hc-select-option-label">{opt.label}</span>
                {chosen ? <Check size={15} className="hc-select-option-check" aria-hidden="true" /> : null}
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
