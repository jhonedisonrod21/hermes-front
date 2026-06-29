import type { ReactNode } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui';
import { HermesDial } from './HermesDial';

type DataStateProps = {
  loading: boolean;
  error: Error | null;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
};

/** Envuelve contenido cargado por `useResource`: muestra spinner/error/vacío o el contenido. */
export function DataState({ loading, error, empty, emptyMessage, onRetry, children }: Readonly<DataStateProps>) {
  const { t } = useTranslation('common');

  if (loading) {
    return (
      <div className="data-state" role="status" aria-live="polite">
        <span className="data-state-dial hc-dial-spinner">
          <HermesDial labels={false} />
        </span>
        <span>{t('dataState.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-state data-state-error" role="alert">
        <AlertTriangle size={26} />
        <span>{error.message || t('dataState.error')}</span>
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t('dataState.retry')}
          </Button>
        ) : null}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="data-state">
        <Inbox size={26} />
        <span>{emptyMessage ?? t('dataState.empty')}</span>
      </div>
    );
  }

  return <>{children}</>;
}
