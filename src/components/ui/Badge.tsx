import type { HTMLAttributes, ReactNode } from 'react';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'accent';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

export function Badge({ children, className = '', tone = 'info', ...props }: BadgeProps) {
  return (
    <span className={`hc-badge hc-badge-${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
