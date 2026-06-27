import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/ui';
import type { AppointmentResponse, AppointmentStatus, UserCardResponse } from '../../api/types';
import { formatDateTime, formatMoney } from '../../lib/format';

const STATUS_TONE: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
  EXPIRED: 'warning'
};

type Props = {
  appointment: AppointmentResponse | null;
  serviceName: (id: string) => string;
  /** Etiqueta legible de un requisito (key -> label de la oferta). */
  requirementLabel: (offeringId: string, key: string) => string;
  /** Ficha del cliente (nombre/correo) resuelta desde el directorio; opcional. */
  customer?: UserCardResponse;
  onClose: () => void;
};

export function AppointmentDetailModal({ appointment, serviceName, requirementLabel, customer, onClose }: Props) {
  const { t, i18n } = useTranslation(['appointments', 'common']);
  const a = appointment;

  const timeShort = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' }).format(new Date(iso));
  const durationMin = a
    ? Math.max(0, Math.round((new Date(a.slotEnd).getTime() - new Date(a.slotStart).getTime()) / 60000))
    : 0;
  const entries = a ? Object.entries(a.requirementValues ?? {}) : [];

  return (
    <Modal open={a !== null} title={t('appointments:detail.title')} onClose={onClose}>
      {a ? (
        <div className="appt-detail">
          <dl className="session-details">
            <div>
              <dt>{t('appointments:detail.service')}</dt>
              <dd className="cell-chips">
                <strong>{serviceName(a.offeringId)}</strong>
                <Badge tone={STATUS_TONE[a.status]}>{t(`appointments:status.${a.status}`)}</Badge>
              </dd>
            </div>
            <div>
              <dt>{t('appointments:detail.when')}</dt>
              <dd>
                {formatDateTime(a.slotStart, i18n.language)} – {timeShort(a.slotEnd)}{' '}
                <span className="appt-detail-muted">· {t('appointments:detail.duration', { minutes: durationMin })}</span>
              </dd>
            </div>
            <div>
              <dt>{t('appointments:detail.price')}</dt>
              <dd>
                {a.priceAmount != null
                  ? formatMoney(a.priceAmount, a.priceCurrency ?? 'USD', i18n.language)
                  : '—'}{' '}
                <span className="appt-detail-muted">
                  ·{' '}
                  {a.requiresOnlinePayment
                    ? t('appointments:detail.paymentOnline')
                    : t('appointments:detail.paymentOnsite')}
                </span>
              </dd>
            </div>
            <div>
              <dt>{t('appointments:detail.customer')}</dt>
              <dd>
                {customer ? (
                  <>
                    {customer.email}
                    {customer.username && customer.username !== customer.email ? (
                      <span className="appt-detail-muted"> · {customer.username}</span>
                    ) : null}
                  </>
                ) : (
                  <code>{a.customerUserId}</code>
                )}
              </dd>
            </div>
            {a.createdAt ? (
              <div>
                <dt>{t('appointments:detail.created')}</dt>
                <dd>{formatDateTime(a.createdAt, i18n.language)}</dd>
              </div>
            ) : null}
          </dl>

          <section className="appt-detail-reqs">
            <span className="hc-field-label">{t('appointments:detail.requirements')}</span>
            {entries.length > 0 ? (
              <dl className="session-details">
                {entries.map(([key, value]) => (
                  <div key={key}>
                    <dt>{requirementLabel(a.offeringId, key)}</dt>
                    <dd>{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="appt-detail-muted">{t('appointments:detail.noRequirements')}</p>
            )}
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
