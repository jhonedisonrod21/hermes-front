import { useCallback, useMemo, useState } from 'react';
import { CalendarClock, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { RescheduleModal } from './RescheduleModal';
import { Badge, Button, Card, Pagination, SearchInput, Select } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useClientTable } from '../../hooks/useClientTable';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { catalogApi, tenantAppointmentsApi } from '../../api/services';
import type { AppointmentResponse, AppointmentStatus } from '../../api/types';
import { formatDateTime, formatMoney } from '../../lib/format';

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
  const offerings = useResource(() => catalogApi.listOfferings({ size: 200 }), []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rescheduleOf, setRescheduleOf] = useState<AppointmentResponse | null>(null);

  const offeringName = useMemo(() => {
    const map = new Map((offerings.data?.content ?? []).map((o) => [o.id, o.name]));
    return (id: string) => map.get(id) ?? id.slice(0, 8);
  }, [offerings.data]);

  const items = appts.data?.content ?? [];
  const visible = statusFilter ? items.filter((a) => a.status === statusFilter) : items;
  const match = useCallback(
    (a: AppointmentResponse, q: string) =>
      offeringName(a.offeringId).toLowerCase().includes(q) || a.customerUserId.toLowerCase().includes(q),
    [offeringName]
  );
  const { paged, page, setPage, totalPages, total } = useClientTable(visible, { query, match });

  async function cancel(a: AppointmentResponse) {
    const ok = await confirm({
      title: t('appointments:confirm.cancelTitle'),
      message: t('appointments:confirm.cancelMessage'),
      confirmLabel: t('appointments:actions.cancel'),
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

  return (
    <div className="page">
      <PageHeader eyebrow={t('appointments:eyebrow')} title={t('appointments:title')} description={t('appointments:listDescription')} />

      <Card className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-filters">
            <SearchInput placeholder={t('appointments:searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
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
          empty={items.length === 0}
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
                    <td><strong>{offeringName(a.offeringId)}</strong></td>
                    <td><code>{a.customerUserId.slice(0, 8)}</code></td>
                    <td>{formatDateTime(a.slotStart, i18n.language)}</td>
                    <td>
                      <Badge tone={STATUS_TONE[a.status]}>{t(`appointments:status.${a.status}`)}</Badge>
                    </td>
                    <td>{a.priceAmount != null ? formatMoney(a.priceAmount, a.priceCurrency ?? 'USD', i18n.language) : '—'}</td>
                    <td className="row-actions">
                      {ACTIVE.includes(a.status) ? (
                        <>
                          <Button variant="ghost" size="sm" icon={<CalendarClock size={15} />} onClick={() => setRescheduleOf(a)}>
                            {t('appointments:actions.reschedule')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<XCircle size={15} />}
                            disabled={busyId === a.id}
                            onClick={() => cancel(a)}
                          >
                            {t('appointments:actions.cancel')}
                          </Button>
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
    </div>
  );
}

