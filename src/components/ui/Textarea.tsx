import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({ className = '', error, hint, id, label, ...props }: TextareaProps) {
  const fieldId = id ?? props.name;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <label className={`hc-field ${className}`.trim()} htmlFor={fieldId}>
      {label ? <span className="hc-field-label">{label}</span> : null}
      <textarea
        className={`hc-textarea ${error ? 'hc-input-error' : ''}`.trim()}
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        {...props}
      />
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
