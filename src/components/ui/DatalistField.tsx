import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

type DatalistFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  /** Sugerencias de autocompletado; el campo sigue aceptando texto libre. */
  options: string[];
};

/** Campo de texto con sugerencias (datalist): desplegable de opciones sin restringir el valor. */
export function DatalistField({ className = '', error, hint, id, label, leadingIcon, options, ...props }: DatalistFieldProps) {
  const fieldId = id ?? props.name;
  const listId = `${useId()}-list`;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <label className={`hc-field ${className}`.trim()} htmlFor={fieldId}>
      <span className="hc-field-label">{label}</span>
      <span className={`hc-input-shell ${error ? 'hc-input-error' : ''}`.trim()}>
        {leadingIcon ? <span className="hc-input-icon">{leadingIcon}</span> : null}
        <input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          id={fieldId}
          list={options.length ? listId : undefined}
          {...props}
        />
      </span>
      {options.length ? (
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
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
    </label>
  );
}
