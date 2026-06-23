import type { InputHTMLAttributes, ReactNode } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingControl?: ReactNode;
};

export function TextField({
  className = '',
  error,
  hint,
  id,
  label,
  leadingIcon,
  trailingControl,
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <label className={`hc-field ${className}`.trim()} htmlFor={fieldId}>
      <span className="hc-field-label">{label}</span>
      <span className={`hc-input-shell ${error ? 'hc-input-error' : ''}`.trim()}>
        {leadingIcon ? <span className="hc-input-icon">{leadingIcon}</span> : null}
        <input aria-describedby={describedBy} aria-invalid={Boolean(error)} id={fieldId} {...props} />
        {trailingControl ? <span className="hc-input-control">{trailingControl}</span> : null}
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
