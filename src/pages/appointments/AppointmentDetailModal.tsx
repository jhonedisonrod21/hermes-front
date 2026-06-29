import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarClock, CheckCircle2, FileDown, FileText, UserX } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { PdfViewerModal } from '../../components/PdfViewerModal';
import { Badge, Button } from '../../components/ui';
import { appointmentsApi, paymentApi, reportsApi } from '../../api/services';
import { ApiError } from '../../api/http';
import type { AppointmentResponse, AppointmentStatus, PaymentResponse, UserCardResponse } from '../../api/types';
import { formatDateTime, formatMoney } from '../../lib/format';

// Anexos en mayúscula sostenida, salvo correos (llevan @) y campos de texto libre (comentarios/notas),
// que se respetan tal cual el usuario los escribió.
const COMMENT_LIKE = /coment|observ|nota|mensaje|descrip/i;
function isPlainTextValue(reqKey: string, label: string, value: string): boolean {
  return value.includes('@') || COMMENT_LIKE.test(reqKey) || COMMENT_LIKE.test(label);
}

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
  /** Tipo de un requisito (key -> TEXT/NUMBER/.../FILE); permite ofrecer la descarga de los anexos FILE. */
  requirementType?: (offeringId: string, key: string) => string | undefined;
  /** Ficha del cliente (nombre/correo) resuelta desde el directorio; opcional. */
  customer?: UserCardResponse;
  /** Marca la cita como completada (con su confirmación). Devuelve true si se completó. */
  onComplete?: (a: AppointmentResponse) => Promise<boolean>;
  /** Marca la cita como no asistida (con su confirmación). Devuelve true si se aplicó. */
  onNoShow?: (a: AppointmentResponse) => Promise<boolean>;
  /** Abre el flujo de reprogramación (reasignar a otro horario). */
  onReschedule?: (a: AppointmentResponse) => void;
  /** Una acción terminal (completar / no asistió) está en curso para esta cita. */
  busy?: boolean;
  onClose: () => void;
};

export function AppointmentDetailModal({
  appointment,
  serviceName,
  requirementLabel,
  requirementType,
  customer,
  onComplete,
  onNoShow,
  onReschedule,
  busy = false,
  onClose
}: Readonly<Props>) {
  const { t, i18n } = useTranslation(['appointments', 'common']);
  const a = appointment;

  const timeShort = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' }).format(new Date(iso));
  const durationMin = a
    ? Math.max(0, Math.round((new Date(a.slotEnd).getTime() - new Date(a.slotStart).getTime()) / 60000))
    : 0;
  const entries = a ? Object.entries(a.requirementValues ?? {}) : [];

  // Si la cita se cobró por adelantado en línea, resolvemos el pago PAGADO para mostrar
  // la etiqueta "Pagada" y habilitar la descarga del comprobante. 404 => no hay cobro pagado.
  const appointmentId = a?.id ?? null;
  const requiresOnlinePayment = a?.requiresOnlinePayment ?? false;
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState(false);

  useEffect(() => {
    setPayment(null);
    if (!appointmentId || !requiresOnlinePayment) return undefined;
    let active = true;
    paymentApi
      .getReceivedPaymentByAppointment(appointmentId)
      .then((p) => {
        if (active) setPayment(p);
      })
      .catch((e) => {
        // 404 (sin cobro pagado) u otros errores: simplemente no mostramos el comprobante.
        if (!(e instanceof ApiError)) throw e;
      });
    return () => {
      active = false;
    };
  }, [appointmentId, requiresOnlinePayment]);

  // Acciones del establecimiento sobre la cita. Completar/no-asistió solo desde CONFIRMED; reprogramar
  // mientras la cita retiene el cupo (PENDING_PAYMENT o CONFIRMED).
  const isActive = Boolean(a && (a.status === 'PENDING_PAYMENT' || a.status === 'CONFIRMED'));
  const canComplete = Boolean(a?.status === 'CONFIRMED' && onComplete);
  const canNoShow = Boolean(a?.status === 'CONFIRMED' && onNoShow);
  const canReschedule = Boolean(a && isActive && onReschedule);

  async function handleComplete() {
    if (!a || !onComplete) return;
    if (await onComplete(a)) onClose();
  }
  async function handleNoShow() {
    if (!a || !onNoShow) return;
    if (await onNoShow(a)) onClose();
  }

  // Anexo (PDF) que se está visualizando en el visor reutilizable.
  const [viewingFile, setViewingFile] = useState<{ key: string; filename: string } | null>(null);

  // Presentación del valor de un requisito: FILE -> botón al visor; BOOLEAN -> SÍ/NO; resto en mayúscula
  // sostenida salvo correos y comentarios (texto libre), que se respetan tal cual.
  function renderRequirementValue(offeringId: string, key: string, value: string) {
    const type = requirementType?.(offeringId, key);
    if (type === 'FILE') {
      return (
        <Button
          variant="ghost"
          size="sm"
          icon={<FileDown size={15} />}
          onClick={() => setViewingFile({ key, filename: value || 'anexo.pdf' })}
        >
          {value || t('appointments:detail.viewFile')}
        </Button>
      );
    }
    if (type === 'BOOLEAN') {
      return <span className="cell-upper">{value === 'true' ? t('common:boolean.yes') : t('common:boolean.no')}</span>;
    }
    if (!value) return '—';
    return isPlainTextValue(key, requirementLabel(offeringId, key), value) ? (
      value
    ) : (
      <span className="cell-upper">{value}</span>
    );
  }

  // Acciones como botones de solo icono con tooltip (demasiados rótulos junto al comprobante).
  const footer = canComplete || canNoShow || canReschedule || payment ? (
    <div className="appt-detail-actions">
      {canComplete ? (
        <Button
          variant="ghost"
          size="sm"
          className="appt-action is-success"
          icon={<CheckCircle2 size={18} />}
          aria-label={t('appointments:actions.complete')}
          title={t('appointments:actions.complete')}
          disabled={busy}
          onClick={handleComplete}
        />
      ) : null}
      {canNoShow ? (
        <Button
          variant="ghost"
          size="sm"
          className="appt-action is-danger"
          icon={<UserX size={18} />}
          aria-label={t('appointments:actions.noShow')}
          title={t('appointments:actions.noShow')}
          disabled={busy}
          onClick={handleNoShow}
        />
      ) : null}
      {canReschedule ? (
        <Button
          variant="ghost"
          size="sm"
          className="appt-action is-info"
          icon={<CalendarClock size={18} />}
          aria-label={t('appointments:actions.reschedule')}
          title={t('appointments:actions.reschedule')}
          onClick={() => a && onReschedule?.(a)}
        />
      ) : null}
      {payment ? (
        <Button
          variant="ghost"
          size="sm"
          className="appt-action is-primary"
          icon={<FileText size={18} />}
          aria-label={t('appointments:detail.viewReceipt')}
          title={t('appointments:detail.viewReceipt')}
          onClick={() => setViewingReceipt(true)}
        />
      ) : null}
    </div>
  ) : undefined;

  return (
    <Modal open={a !== null} title={t('appointments:detail.title')} onClose={onClose} footer={footer}>
      {a ? (
        <div className="appt-detail">
          <dl className="session-details appt-detail-grid">
            <div className="appt-detail-wide">
              <dt>{t('appointments:detail.service')}</dt>
              <dd className="cell-chips">
                <strong className="cell-upper">{serviceName(a.offeringId)}</strong>
                <Badge tone={STATUS_TONE[a.status]}>{t(`appointments:status.${a.status}`)}</Badge>
                {payment ? <Badge tone="success">{t('appointments:detail.paid')}</Badge> : null}
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
                  customer.name ? (
                    <>
                      <span className="cell-upper">{customer.name}</span>
                      <span className="appt-detail-muted"> · {customer.email}</span>
                    </>
                  ) : (
                    customer.email
                  )
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
              <dl className="session-details appt-detail-grid">
                {entries.map(([key, value]) => (
                  <div key={key}>
                    <dt>{requirementLabel(a.offeringId, key)}</dt>
                    <dd>{renderRequirementValue(a.offeringId, key, value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="appt-detail-muted">{t('appointments:detail.noRequirements')}</p>
            )}
          </section>
        </div>
      ) : null}

      {a && payment && viewingReceipt ? (
        <PdfViewerModal
          open
          title={t('appointments:detail.receiptTitle')}
          fileName={`comprobante-${payment.id}.pdf`}
          load={() => reportsApi.receiptBlob(payment.id)}
          onClose={() => setViewingReceipt(false)}
        />
      ) : null}

      {a && viewingFile ? (
        <PdfViewerModal
          open
          title={requirementLabel(a.offeringId, viewingFile.key)}
          fileName={viewingFile.filename}
          load={() => appointmentsApi.requirementFileBlob(a.id, viewingFile.key)}
          onClose={() => setViewingFile(null)}
        />
      ) : null}
    </Modal>
  );
}
