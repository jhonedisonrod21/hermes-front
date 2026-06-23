import type { InputHTMLAttributes } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function Checkbox({ className = '', label, ...props }: CheckboxProps) {
  return (
    <label className={`hc-checkbox ${className}`.trim()}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
