import { useCallback, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Eye, UserX, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { RescheduleModal } from './RescheduleModal';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { Badge, Button, Card, Pagination, SearchInput, Select } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useClientTable } from '../../hooks/useClientTable';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { catalogApi, identityApi, tenantAppointmentsApi } from '../../api/services';
import type { AppointmentResponse, AppointmentStatus } from '../../api/types';
import { formatDateTime, formatMoney } from '../../lib/format';

type Scope = '' | 'today' | 'upcoming' | 'past';
const SCOPES: Scope[] = ['', 'today', 'upcoming', 'past'];

function isSameLocalDay(iso: string, ref: Date) {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

const STATUSES: AppointmentStatus[] = ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'EXPIRED'];

const STATUS_TONE: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
  EXPIRED: 'warning'
};

/** Estados sobre los que aún se puede actuar (cancelar / reprogramar). */
const ACTIVE: AppointmentStatus[] = ['PENDING_PAYMENT', 'CONFIRMED'];

export function AppointmentsPage() {
  const { t, i18n } = useTranslation(['appointments', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const appts = useResource(() => tenantAppointmentsApi.list({ size: 200, sort: 'slotStart,desc' }), []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scope, setScope] = useState<Scope>('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rescheduleOf, setRescheduleOf] = useState<AppointmentResponse | null>(null);
  const [detailOf, setDetailOf] = useState<AppointmentResponse | null>(null);

  const items = appts.data?.content ?? [];

  // El nombre y los requisitos de cada servicio se resuelven por el detalle público de la oferta
  // (/catalog/search/{id}), accesible tanto al TENANT_ADMIN como al TENANT_PARTNER. El listado
  // administrativo del catálogo no está permitido al colaborador, por eso no se usa aquí.
  const offeringIdsKey = useMemo(
    () => [...new Set(items.map((a) => a.offeringId))].sort().join(','),
    [items]
  );
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

  // Etiqueta legible de cada requisito (offeringId -> key -> label) para el detalle.
  const requirementLabel = useMemo(() => {
    const byOffering = new Map(
      (offerings.data ?? [])
        .filter(Boolean)
        .map((o) => [o!.id, new Map((o!.requirements ?? []).map((r) => [r.key, r.label]))])
    );
    return (offeringId: string, key: string) => byOffering.get(offeringId)?.get(key) ?? key;
  }, [offerings.data]);

  // Resuelve el contacto del cliente (id -> nombre/correo) en lote desde el directorio del tenant.
  const customerIdsKey = useMemo(
    () => [...new Set(items.map((a) => a.customerUserId))].sort().join(','),
    [items]
  );
  const customers = useResource(
    // El directorio resuelve hasta 100 ids por lote: acotamos para no exceder el límite del backend.
    () => (customerIdsKey ? identityApi.getUserCards(customerIdsKey.split(',').slice(0, 100)) : Promise.resolve([])),
    [customerIdsKey]
  );
  const customerCard = useMemo(() => {
    const map = new Map((customers.data ?? []).map((c) => [c.id, c]));
    return (id: string) => map.get(id);
  }, [customers.data]);
  const customerLabel = useCallback(
    (a: AppointmentResponse) => {
      const c = customerCard(a.customerUserId);
      return c?.email || c?.username || `${a.customerUserId.slice(0, 8)}…`;
    },
    [customerCard]
  );

  // Filtro por estado + alcance temporal, y orden (próximas/hoy: lo más cercano primero).
  const visible = useMemo(() => {
    const now = new Date();
    let list = statusFilter ? items.filter((a) => a.status === statusFilter) : items;
    if (scope === 'today') list = list.filter((a) => isSameLocalDay(a.slotStart, now));
    else if (scope === 'upcoming') list = list.filter((a) => new Date(a.slotStart).getTime() >= now.getTime());
    else if (scope === 'past') list = list.filter((a) => new Date(a.slotStart).getTime() < now.getTime());
    const asc = scope === 'today' || scope === 'upcoming';
    return [...list].sort((a, b) =>
      asc
        ? new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime()
        : new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime()
    );
  }, [items, statusFilter, scope]);
  const match = useCallback(
    (a: AppointmentResponse, q: string) =>
      offeringName(a.offeringId).toLowerCase().includes(q) ||
      customerLabel(a).toLowerCase().includes(q) ||
      a.customerUserId.toLowerCase().includes(q),
    [offeringName, customerLabel]
  );
  const { paged, page, setPage, totalPages, total } = useClientTable(visible, {
    query,
    match,
    resetKey: `${statusFilter}|${scope}`
  });

  async function cancel(a: AppointmentResponse) {
    const ok = await confirm({
      title: t('appointments:confirm.cancelTitle'),
      message: t('appointments:confirm.cancelMessage'),
      confirmLabel: t('appointments:confirm.cancelConfirm'),
      cancelLabel: t('common:actions.back'),
      danger: true
    });
    if (!ok) return;
    setBusyId(a.id);
    try {
      await tenantAppointmentsApi.cancel(a.id);
      toast.success(t('appointments:toast.cancelled'));
      appts.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  // Marca la cita como atendida (CONFIRMED -> COMPLETED). Estado terminal: confirma antes.
  async function complete(a: AppointmentResponse) {
    const ok = await confirm({
      title: t('appointments:confirm.completeTitle'),
      message: t('appointments:confirm.completeMessage'),
      confirmLabel: t('appointments:actions.complete')
    });
    if (!ok) return;
    setBusyId(a.id);
    try {
      await tenantAppointmentsApi.complete(a.id);
      toast.success(t('appointments:toast.completed'));
      appts.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  // Marca que el cliente no se presentó (CONFIRMED -> NO_SHOW). Terminal: pide confirmación.
  async function markNoShow(a: AppointmentResponse) {
    const ok = await confirm({
      title: t('appointments:confirm.noShowTitle'),
      message: t('appointments:confirm.noShowMessage'),
      confirmLabel: t('appointments:actions.noShow'),
      danger: true
    });
    if (!ok) return;
    setBusyId(a.id);
    try {
      await tenantAppointmentsApi.noShow(a.id);
      toast.success(t('appointments:toast.noShow'));
      appts.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <PageHeader eyebrow={t('appointments:eyebrow')} title={t('appointments:title')} description={t('appointments:listDescription')} />

      <Card className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-filters">
            <SearchInput placeholder={t('appointments:searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select
              className="toolbar-filter"
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              options={SCOPES.map((s) => ({
                value: s,
                label: s ? t(`appointments:scope.${s}`) : t('appointments:scope.all')
              }))}
            />
            <Select
              className="toolbar-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder={t('appointments:allStatus')}
              options={STATUSES.map((s) => ({ value: s, label: t(`appointments:status.${s}`) }))}
            />
          </div>
          <span className="table-toolbar-count">{t('common:pagination.items', { count: total })}</span>
        </div>
        <DataState
          loading={appts.loading}
          error={appts.error}
          empty={total === 0}
          emptyMessage={t('appointments:empty')}
          onRetry={appts.reload}
        >
          <div className="hc-table-scroll">
            <table className="hc-table">
              <thead>
                <tr>
                  <th>{t('appointments:columns.service')}</th>
                  <th>{t('appointments:columns.customer')}</th>
                  <th>{t('appointments:columns.start')}</th>
                  <th>{t('appointments:columns.status')}</th>
                  <th>{t('appointments:columns.price')}</th>
                  <th aria-label={t('common:actions.label')} />
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => (
                  <tr key={a.id}>
                    <td className="cell-clamp"><strong>{offeringName(a.offeringId)}</strong></td>
                    <td className="cell-clamp">{customerLabel(a)}</td>
                    <td className="cell-nowrap">{formatDateTime(a.slotStart, i18n.language)}</td>
                    <td>
                      <Badge tone={STATUS_TONE[a.status]}>{t(`appointments:status.${a.status}`)}</Badge>
                    </td>
                    <td className="cell-nowrap">{a.priceAmount != null ? formatMoney(a.priceAmount, a.priceCurrency ?? 'USD', i18n.language) : '—'}</td>
                    <td className="row-actions row-actions-icons">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="row-icon"
                        icon={<Eye size={16} />}
                        aria-label={t('appointments:actions.view')}
                        title={t('appointments:actions.view')}
                        onClick={() => setDetailOf(a)}
                      />
                      {a.status === 'CONFIRMED' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="row-icon appt-complete"
                            icon={<CheckCircle2 size={16} />}
                            aria-label={t('appointments:actions.complete')}
                            title={t('appointments:actions.complete')}
                            disabled={busyId === a.id}
                            onClick={() => complete(a)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="row-icon appt-noshow"
                            icon={<UserX size={16} />}
                            aria-label={t('appointments:actions.noShow')}
                            title={t('appointments:actions.noShow')}
                            disabled={busyId === a.id}
                            onClick={() => markNoShow(a)}
                          />
                        </>
                      ) : null}
                      {ACTIVE.includes(a.status) ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="row-icon"
                            icon={<CalendarClock size={16} />}
                            aria-label={t('appointments:actions.reschedule')}
                            title={t('appointments:actions.reschedule')}
                            onClick={() => setRescheduleOf(a)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="row-icon appt-noshow"
                            icon={<XCircle size={16} />}
                            aria-label={t('appointments:actions.cancel')}
                            title={t('appointments:actions.cancel')}
                            disabled={busyId === a.id}
                            onClick={() => cancel(a)}
                          />
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalElements={total} onChange={setPage} />
        </DataState>
      </Card>

      <RescheduleModal
        appointment={rescheduleOf}
        serviceName={offeringName}
        reschedule={tenantAppointmentsApi.reschedule}
        onClose={() => setRescheduleOf(null)}
        onDone={appts.reload}
      />
      <AppointmentDetailModal
        appointment={detailOf}
        serviceName={offeringName}
        requirementLabel={requirementLabel}
        customer={detailOf ? customerCard(detailOf.customerUserId) : undefined}
        onClose={() => setDetailOf(null)}
      />
    </div>
  );
}

