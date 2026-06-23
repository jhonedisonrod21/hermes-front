import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  tone?: 'surface' | 'highlight';
};

export function Card({ children, className = '', tone = 'surface', ...props }: CardProps) {
  return (
    <section className={`hc-card hc-card-${tone} ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
