import { useCallback, useMemo, useState } from 'react';
import { CalendarClock, CalendarDays, CheckCircle2, Eye, List, UserX, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, addDays, subDays, format } from 'date-fns';
import type { View } from 'react-big-calendar';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { RescheduleModal } from './RescheduleModal';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { AppointmentCalendar, type CalendarEvent } from './AppointmentCalendar';
import { Badge, Button, Card, Pagination, SearchInput, Select } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useServerTable } from '../../hooks/useServerTable';
import { tenantAppointmentsApi } from '../../api/services';
import type { AppointmentResponse } from '../../api/types';
import { formatDateTime, formatMoney } from '../../lib/format';
import { useAppointmentDirectory } from './useAppointmentDirectory';
import { useAppointmentActions } from './useAppointmentActions';
import { ACTIVE, STATUS_TONE, STATUSES } from './appointmentMeta';

type ViewMode = 'calendar' | 'list';
type Scope = '' | 'today' | 'upcoming' | 'past';
const SCOPES: Scope[] = ['', 'today', 'upcoming', 'past'];

function isSameLocalDay(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

/** Rango [from, to) que cubre la vista del calendario, con holgura para la rejilla del mes/semana. */
function calendarRange(date: Date, view: View): { from: string; to: string } {
  let start: Date;
  let end: Date;
  if (view === 'day') {
    start = startOfDay(date);
    end = addDays(start, 1);
  } else if (view === 'week') {
    start = subDays(startOfWeek(date), 1);
    end = addDays(endOfWeek(date), 2);
  } else {
    start = subDays(startOfMonth(date), 7);
    end = addDays(endOfMonth(date), 7);
  }
  const fmt = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm:ss");
  return { from: fmt(start), to: fmt(end) };
}

export function AppointmentsPage() {
  const { t, i18n } = useTranslation(['appointments', 'common']);
  const [view, setView] = useState<ViewMode>('calendar');

  // --- Vista lista (paginada en servidor + filtros locales sobre la página cargada) ---
  const table = useServerTable((p) => tenantAppointmentsApi.list({ ...p, sort: 'slotStart,desc' }), { size: 12 });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scope, setScope] = useState<Scope>('');

  // --- Vista calendario (citas del rango visible) ---
  const [calDate, setCalDate] = useState<Date>(() => new Date());
  const [rbcView, setRbcView] = useState<View>('month');
  const range = useMemo(() => calendarRange(calDate, rbcView), [calDate, rbcView]);
  const calendar = useResource(() => tenantAppointmentsApi.listCalendar(range.from, range.to), [range.from, range.to]);

  const [rescheduleOf, setRescheduleOf] = useState<AppointmentResponse | null>(null);
  const [detailOf, setDetailOf] = useState<AppointmentResponse | null>(null);

  // El conjunto activo (según la vista) alimenta la resolución de nombres y la recarga tras una acción.
  const activeItems = view === 'calendar' ? calendar.data ?? [] : table.items;
  const dir = useAppointmentDirectory(activeItems);
  const reloadActive = useCallback(() => {
    if (view === 'calendar') calendar.reload();
    else table.reload();
  }, [view, calendar, table]);
  const actions = useAppointmentActions(reloadActive);

  const events: CalendarEvent[] = useMemo(
    () =>
      (calendar.data ?? []).map((a) => ({
        id: a.id,
        title: `${dir.offeringName(a.offeringId)} · ${dir.customerLabel(a)}`,
        start: new Date(a.slotStart),
        end: new Date(a.slotEnd),
        appointment: a
      })),
    [calendar.data, dir]
  );

  // Filtro por estado + alcance temporal y orden (solo aplica a la vista lista).
  const visible = useMemo(() => {
    const now = new Date();
    let list = statusFilter ? table.items.filter((a) => a.status === statusFilter) : table.items;
    if (scope === 'today') list = list.filter((a) => isSameLocalDay(a.slotStart, now));
    else if (scope === 'upcoming') list = list.filter((a) => new Date(a.slotStart).getTime() >= now.getTime());
    else if (scope === 'past') list = list.filter((a) => new Date(a.slotStart).getTime() < now.getTime());
    const asc = scope === 'today' || scope === 'upcoming';
    return [...list].sort((a, b) =>
      asc
        ? new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime()
        : new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime()
    );
  }, [table.items, statusFilter, scope]);
  const match = useCallback(
    (a: AppointmentResponse, qq: string) =>
      dir.offeringName(a.offeringId).toLowerCase().includes(qq) ||
      dir.customerLabel(a).toLowerCase().includes(qq) ||
      a.customerUserId.toLowerCase().includes(qq),
    [dir]
  );
  const q = query.trim().toLowerCase();
  const clientFiltered = useMemo(() => (q ? visible.filter((a) => match(a, q)) : visible), [visible, match, q]);
  const pageFilterActive = Boolean(q || statusFilter || scope);

  const viewToggle = (
    <div className="hc-view-toggle" role="group" aria-label={t('appointments:view.label')}>
      <Button
        variant={view === 'calendar' ? undefined : 'ghost'}
        size="sm"
        icon={<CalendarDays size={16} />}
        aria-pressed={view === 'calendar'}
        onClick={() => setView('calendar')}
      >
        {t('appointments:view.calendar')}
      </Button>
      <Button
        variant={view === 'list' ? undefined : 'ghost'}
        size="sm"
        icon={<List size={16} />}
        aria-pressed={view === 'list'}
        onClick={() => setView('list')}
      >
        {t('appointments:view.list')}
      </Button>
    </div>
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow={t('appointments:eyebrow')}
        title={t('appointments:title')}
        description={t('appointments:listDescription')}
        tools={
          view === 'list' ? (
            <>
              {viewToggle}
              <SearchInput
                placeholder={t('appointments:searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select
                className="toolbar-filter"
                value={scope}
                onChange={(e) => setScope(e.target.value as Scope)}
                options={SCOPES.map((s) => ({ value: s, label: s ? t(`appointments:scope.${s}`) : t('appointments:scope.all') }))}
              />
              <Select
                className="toolbar-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder={t('appointments:allStatus')}
                options={STATUSES.map((s) => ({ value: s, label: t(`appointments:status.${s}`) }))}
              />
              <span className="table-toolbar-count">{t('common:pagination.items', { count: table.totalElements })}</span>
              {pageFilterActive ? (
                <span className="table-toolbar-hint" title={t('common:pagination.currentPageFilterHint')}>
                  {t('common:pagination.currentPageFilter')}
                </span>
              ) : null}
            </>
          ) : (
            viewToggle
          )
        }
      />

      {view === 'calendar' ? (
        <Card className="panel calendar-card">
          <DataState
            loading={calendar.loading && events.length === 0}
            error={calendar.error}
            onRetry={calendar.reload}
          >
            <AppointmentCalendar
              events={events}
              date={calDate}
              view={rbcView}
              onView={setRbcView}
              onNavigate={setCalDate}
              onSelectEvent={setDetailOf}
            />
          </DataState>
        </Card>
      ) : (
        <Card className="table-card">
          <DataState
            loading={table.loading}
            error={table.error}
            empty={clientFiltered.length === 0}
            emptyMessage={t('appointments:empty')}
            onRetry={table.reload}
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
                  {clientFiltered.map((a) => (
                    <tr key={a.id}>
                      <td className="cell-clamp"><strong>{dir.offeringName(a.offeringId)}</strong></td>
                      <td className="cell-clamp">{dir.customerLabel(a)}</td>
                      <td className="cell-nowrap">{formatDateTime(a.slotStart, i18n.language)}</td>
                      <td>
                        <Badge tone={STATUS_TONE[a.status]}>{t(`appointments:status.${a.status}`)}</Badge>
                      </td>
                      <td className="cell-nowrap">
                        {a.priceAmount != null ? formatMoney(a.priceAmount, a.priceCurrency ?? 'USD', i18n.language) : '—'}
                      </td>
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
                              disabled={actions.busyId === a.id}
                              onClick={() => actions.complete(a)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="row-icon appt-noshow"
                              icon={<UserX size={16} />}
                              aria-label={t('appointments:actions.noShow')}
                              title={t('appointments:actions.noShow')}
                              disabled={actions.busyId === a.id}
                              onClick={() => actions.markNoShow(a)}
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
                              disabled={actions.busyId === a.id}
                              onClick={() => actions.cancel(a)}
                            />
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={table.page} totalPages={table.totalPages} totalElements={table.totalElements} onChange={table.setPage} />
          </DataState>
        </Card>
      )}

      <RescheduleModal
        appointment={rescheduleOf}
        serviceName={dir.offeringName}
        reschedule={tenantAppointmentsApi.reschedule}
        onClose={() => setRescheduleOf(null)}
        onDone={reloadActive}
      />
      <AppointmentDetailModal
        appointment={detailOf}
        serviceName={dir.offeringName}
        requirementLabel={dir.requirementLabel}
        requirementType={dir.requirementType}
        customer={detailOf ? dir.customerCard(detailOf.customerUserId) : undefined}
        onComplete={actions.complete}
        onNoShow={actions.markNoShow}
        onReschedule={(a) => {
          setDetailOf(null);
          setRescheduleOf(a);
        }}
        busy={detailOf ? actions.busyId === detailOf.id : false}
        onClose={() => setDetailOf(null)}
      />
    </div>
  );
}
