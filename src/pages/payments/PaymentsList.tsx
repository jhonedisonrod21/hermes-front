import { useEffect, useRef, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DataState } from '../../components/DataState';
import { PdfViewerModal } from '../../components/PdfViewerModal';
import { Badge, Button, Card } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import type { Page } from '../../api/http';
import type { PaymentResponse, PaymentStatus } from '../../api/types';
import { formatDateTime, formatMoney } from '../../lib/format';

const TONE: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PAID: 'success',
  PENDING: 'warning',
  FAILED: 'danger',
  EXPIRED: 'warning',
  CANCELLED: 'danger'
};

type Props = {
  title?: string;
  loader: () => Promise<Page<PaymentResponse>>;
  /** Oculta toda la sección si no hay pagos (útil para no ensuciar la vista del invitado). */
  hideWhenEmpty?: boolean;
  /** Cargador del comprobante PDF por pago. Si se pasa, muestra el botón en pagos PAGADOS.
   *  Tenant: reportsApi.receiptBlob · Invitado: reportsApi.myReceiptBlob. */
  receiptLoader?: (paymentId: string) => Promise<Blob>;
  /** Oculta el toolbar interno (título + conteo) cuando la página ya lo maneja junto a la miga de pan. */
  showToolbar?: boolean;
  /** Notifica el total y cuántos se muestran, para que la página lo exponga en la cabecera. */
  onTotal?: (total: number, shown: number) => void;
};

/** Lista reutilizable de pagos: cobros recibidos (tenant) o historial propio (invitado). */
export function PaymentsList({ title, loader, hideWhenEmpty = false, receiptLoader, showToolbar = true, onTotal }: Props) {
  const { t, i18n } = useTranslation(['payments', 'common']);
  const payments = useResource<Page<PaymentResponse>>(loader, []);
  const items = payments.data?.content ?? [];
  const total = payments.data?.totalElements ?? items.length;
  // El loader trae una ventana (p. ej. 50); si hay más, lo indicamos para no engañar con el conteo.
  const truncated = total > items.length;

  // Pago cuyo comprobante se está visualizando en el visor de PDF compartido.
  const [receiptOf, setReceiptOf] = useState<PaymentResponse | null>(null);

  // Sube el conteo a la página (para mostrarlo junto a la miga) sin acoplar la identidad del callback.
  const onTotalRef = useRef(onTotal);
  onTotalRef.current = onTotal;
  useEffect(() => {
    onTotalRef.current?.(total, items.length);
  }, [total, items.length]);

  if (hideWhenEmpty && !payments.loading && !payments.error && items.length === 0) return null;

  return (
    <Card className="table-card">
      {showToolbar ? (
        <div className="table-toolbar">
          <strong className="payments-list-title">{title ?? t('payments:history.title')}</strong>
          <span className="table-toolbar-count">
            {t('common:pagination.items', { count: total })}
            {truncated ? ` · ${t('payments:history.showingLatest', { count: items.length })}` : ''}
          </span>
        </div>
      ) : null}
      <DataState
        loading={payments.loading}
        error={payments.error}
        empty={items.length === 0}
        emptyMessage={t('payments:history.empty')}
        onRetry={payments.reload}
      >
        <div className="hc-table-scroll">
          <table className="hc-table">
            <thead>
              <tr>
                <th>{t('payments:history.date')}</th>
                <th>{t('payments:history.amount')}</th>
                <th>{t('payments:history.status')}</th>
                <th>{t('payments:history.appointment')}</th>
                <th aria-label={t('common:actions.label')} />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="cell-nowrap">{formatDateTime(p.createdAt, i18n.language)}</td>
                  <td className="cell-nowrap"><strong>{formatMoney(p.amount, p.currency, i18n.language)}</strong></td>
                  <td>
                    <Badge tone={TONE[p.status]}>{t(`payments:history.statuses.${p.status}`)}</Badge>
                  </td>
                  <td><code>{p.appointmentId.slice(0, 8)}</code></td>
                  <td className="row-actions">
                    {p.status === 'PENDING' && p.checkoutUrl ? (
                      <a className="hc-button hc-button-ghost hc-button-sm" href={p.checkoutUrl} target="_blank" rel="noreferrer">
                        <span className="hc-button-icon"><ExternalLink size={15} /></span>
                        <span>{t('payments:history.resume')}</span>
                      </a>
                    ) : null}
                    {receiptLoader && p.status === 'PAID' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<FileText size={15} />}
                        onClick={() => setReceiptOf(p)}
                      >
                        {t('payments:history.receipt')}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>

      {receiptLoader && receiptOf ? (
        <PdfViewerModal
          open
          title={t('payments:history.receiptTitle')}
          fileName={`comprobante-${receiptOf.id}.pdf`}
          load={() => receiptLoader(receiptOf.id)}
          onClose={() => setReceiptOf(null)}
        />
      ) : null}
    </Card>
  );
}
