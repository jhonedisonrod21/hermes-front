import { useMemo, useState } from 'react';
import { CalendarClock, Compass, CreditCard, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { RescheduleModal } from '../appointments/RescheduleModal';
import { PaymentModal } from './PaymentModal';
import { PaymentsList } from '../payments/PaymentsList';
import { Badge, Button } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { appointmentsApi, catalogApi, paymentApi, reportsApi } from '../../api/services';
import type { AppointmentResponse, AppointmentStatus } from '../../api/types';
import { formatDateTime, formatMoney } from '../../lib/format';

const STATUS_TONE: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
  EXPIRED: 'warning'
};

const ACTIVE = new Set<AppointmentStatus>(['PENDING_PAYMENT', 'CONFIRMED']);
const PAGE = 6;

export function MyBookingsPage() {
  const { t, i18n } = useTranslation(['bookings', 'appointments', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const appts = useResource(() => appointmentsApi.listMine({ size: 200, sort: 'slotStart,desc' }), []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rescheduleOf, setRescheduleOf] = useState<AppointmentResponse | null>(null);
  const [payingOf, setPayingOf] = useState<AppointmentResponse | null>(null);
  // Cuántas tarjetas se muestran por sección (botón "Cargar más").
  const [upShown, setUpShown] = useState(PAGE);
  const [pastShown, setPastShown] = useState(PAGE);

  const items = useMemo(() => appts.data?.content ?? [], [appts.data]);
  // "Próximas" = citas activas cuya fecha aún no ha pasado (desde el inicio del día de hoy).
  // Una cita activa con fecha pasada (p. ej. CONFIRMADA que el negocio aún no cerró) ya no
  // es "próxima": se muestra en el historial para no confundir al cliente.
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const isUpcoming = (a: AppointmentResponse) =>
    ACTIVE.has(a.status) && new Date(a.slotStart).getTime() >= startOfToday;
  // Próximas: la más cercana primero. Historial (resto): la más reciente primero.
  const upcoming = useMemo(
    () =>
      items
        .filter(isUpcoming)
        .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime()),
    [items, startOfToday]
  );
  const past = useMemo(
    () =>
      items
        .filter((a) => !isUpcoming(a))
        .sort((a, b) => new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime()),
    [items, startOfToday]
  );
  const offeringIdsKey = useMemo(() => [...new Set(items.map((a) => a.offeringId))].sort((a, b) => a.localeCompare(b)).join(','), [items]);
  // El invitado resuelve el nombre del servicio por el detalle público de cada oferta.
  const offerings = useResource(
    () =>
      Promise.all(
        (offeringIdsKey ? offeringIdsKey.split(',') : []).map((id) =>
          catalogApi.getPublicOffering(id).catch(() => null)
        )
      ),
    [offeringIdsKey]
  );
  const offeringName = useMemo(() => {
    const map = new Map((offerings.data ?? []).filter(Boolean).map((o) => [o!.id, o!.name]));
    return (id: string) => map.get(id) ?? id.slice(0, 8);
  }, [offerings.data]);

  async function cancel(a: AppointmentResponse) {
    const ok = await confirm({
      title: t('bookings:confirm.cancelTitle'),
      message: t('bookings:confirm.cancelMessage'),
      confirmLabel: t('bookings:confirm.cancelConfirm'),
      cancelLabel: t('common:actions.back'),
      danger: true
    });
    if (!ok) return;
    setBusyId(a.id);
    try {
      await appointmentsApi.cancel(a.id);
      toast.success(t('appointments:toast.cancelled'));
      appts.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  function renderCard(a: AppointmentResponse, isPast = false) {
    return (
      <article key={a.id} className={`svc-card booking-card${isPast ? ' is-past' : ''}`}>
        <div className="svc-card-band">
          <Badge tone={STATUS_TONE[a.status]}>{t(`appointments:status.${a.status}`)}</Badge>
          <span className="booking-band-date">
            <CalendarClock size={14} /> {formatDateTime(a.slotStart, i18n.language)}
          </span>
        </div>
        <div className="svc-card-body">
          <h3>{offeringName(a.offeringId)}</h3>
          {a.priceAmount != null ? (
            <p className="booking-price">{formatMoney(a.priceAmount, a.priceCurrency ?? 'USD', i18n.language)}</p>
          ) : null}
        </div>
        {ACTIVE.has(a.status) ? (
          <div className="booking-actions">
            {a.status === 'PENDING_PAYMENT' ? (
              <Button
                variant="accent"
                size="sm"
                fullWidth
                icon={<CreditCard size={15} />}
                onClick={() => setPayingOf(a)}
              >
                {t('bookings:pay.action')}
              </Button>
            ) : null}
            <div className="booking-actions-row">
              <Button
                variant="ghost"
                size="sm"
                icon={<CalendarClock size={15} />}
                onClick={() => setRescheduleOf(a)}
              >
                {t('appointments:actions.reschedule')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="booking-cancel"
                icon={<XCircle size={15} />}
                disabled={busyId === a.id}
                onClick={() => cancel(a)}
              >
                {t('appointments:actions.cancel')}
              </Button>
            </div>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title={t('bookings:title')}
        description={t('bookings:listDescription')}
        actions={
          <Link to="/" className="hc-button hc-button-secondary hc-button-md">
            <span className="hc-button-icon"><Compass size={18} /></span>
            <span>{t('bookings:explore')}</span>
          </Link>
        }
      />

      <DataState
        loading={appts.loading}
        error={appts.error}
        empty={items.length === 0}
        emptyMessage={t('bookings:empty')}
        onRetry={appts.reload}
      >
        <div className="booking-sections">
          {upcoming.length > 0 ? (
            <section className="booking-section">
              <header className="booking-section-head">
                <h2>{t('bookings:sections.upcoming')}</h2>
                <span className="booking-section-count">{upcoming.length}</span>
              </header>
              <div className="booking-grid">{upcoming.slice(0, upShown).map((a) => renderCard(a))}</div>
              {upcoming.length > upShown ? (
                <div className="booking-more">
                  <Button variant="ghost" size="sm" onClick={() => setUpShown((n) => n + PAGE)}>
                    {t('bookings:loadMore', { count: upcoming.length - upShown })}
                  </Button>
                </div>
              ) : null}
            </section>
          ) : null}

          {past.length > 0 ? (
            <section className="booking-section">
              <header className="booking-section-head">
                <h2>{t('bookings:sections.past')}</h2>
                <span className="booking-section-count">{past.length}</span>
              </header>
              <div className="booking-grid">{past.slice(0, pastShown).map((a) => renderCard(a, true))}</div>
              {past.length > pastShown ? (
                <div className="booking-more">
                  <Button variant="ghost" size="sm" onClick={() => setPastShown((n) => n + PAGE)}>
                    {t('bookings:loadMore', { count: past.length - pastShown })}
                  </Button>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </DataState>

      <PaymentsList
        loader={() => paymentApi.listMyPayments({ size: 50, sort: 'createdAt,desc' })}
        receiptLoader={reportsApi.myReceiptBlob}
        hideWhenEmpty
      />

      <RescheduleModal
        appointment={rescheduleOf}
        serviceName={offeringName}
        reschedule={appointmentsApi.reschedule}
        onClose={() => setRescheduleOf(null)}
        onDone={appts.reload}
      />
      <PaymentModal appointment={payingOf} serviceName={offeringName} onClose={() => setPayingOf(null)} />
    </div>
  );
}

