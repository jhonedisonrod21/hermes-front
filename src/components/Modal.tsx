import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Clase extra para el diálogo (p. ej. 'hc-modal-wide' para visores de PDF). */
  className?: string;
};

export function Modal({ open, title, onClose, children, footer, className = '' }: ModalProps) {
  const { t } = useTranslation('common');

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="hc-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className={`hc-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="hc-modal-header">
          <div className="hc-modal-title">
            <img className="hc-modal-mark" src="/brand/hermes-logo-app-icon.svg" alt="" aria-hidden="true" />
            <h2>{title}</h2>
          </div>
          <button className="hc-icon-button" type="button" onClick={onClose} aria-label={t('actions.close')}>
            <X size={18} />
          </button>
        </header>
        <div className="hc-modal-body">{children}</div>
        {footer ? <footer className="hc-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
