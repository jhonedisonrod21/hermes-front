import type { SelectHTMLAttributes } from 'react';

export type SelectOption = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({ className = '', error, hint, id, label, options, placeholder, ...props }: SelectProps) {
  const fieldId = id ?? props.name;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <label className={`hc-field ${className}`.trim()} htmlFor={fieldId}>
      {label ? <span className="hc-field-label">{label}</span> : null}
      <span className={`hc-input-shell ${error ? 'hc-input-error' : ''}`.trim()}>
        <select className="hc-select" id={fieldId} aria-describedby={describedBy} aria-invalid={Boolean(error)} {...props}>
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
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
