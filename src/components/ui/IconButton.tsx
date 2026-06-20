import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({ className = '', icon, label, type = 'button', ...props }: IconButtonProps) {
  return (
    <button aria-label={label} className={`hc-icon-button ${className}`.trim()} title={label} type={type} {...props}>
      {icon}
    </button>
  );
}
