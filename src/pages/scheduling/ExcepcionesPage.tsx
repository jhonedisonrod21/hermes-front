import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SlotInfo } from 'react-big-calendar';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Card } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../components/feedback/toast';
import { schedulingApi } from '../../api/services';
import type { DayOfWeek, ScheduleExceptionResponse } from '../../api/types';
import { ExceptionCalendar, type ExceptionEvent } from './ExceptionCalendar';
import { ExceptionFormModal } from './ExceptionFormModal';
import { ExceptionDetailModal } from './ExceptionDetailModal';
import { parseISODate, toISODate, dayOfWeekOf, TYPE_COLOR, NONWORKING_COLOR } from './exceptionMeta';

/** Días que cubre la rejilla del mes visible (semanas completas, dom..sáb). */
function visibleGridDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

/**
 * Excepciones de calendario (cierres o jornadas especiales) del establecimiento, gestionadas sobre un
 * calendario mensual: clic en un día para marcarlo, arrastre para marcar un rango (vacaciones), clic en
 * una excepción existente para verla o eliminarla.
 */
export function ExcepcionesPage() {
  const { t } = useTranslation(['schedule', 'common']);
  const toast = useToast();
  const exceptions = useResource(() => schedulingApi.listExceptions({ size: 100, sort: 'date,asc' }), []);
  // Horario de atención: define qué días de la semana son laborables. Los demás se marcan como "no
  // laborable" en el calendario (solo capa de presentación; no se persiste).
  const hours = useResource(() => schedulingApi.getHours(), []);
  const workingDays = useMemo<Set<DayOfWeek> | undefined>(
    () => (hours.data ? new Set(hours.data.map((h) => h.dayOfWeek)) : undefined),
    [hours.data]
  );
  const [calDate, setCalDate] = useState<Date>(() => new Date());
  const [createDates, setCreateDates] = useState<string[] | null>(null);
  const [detailOf, setDetailOf] = useState<ScheduleExceptionResponse | null>(null);

  const items = useMemo(() => exceptions.data?.content ?? [], [exceptions.data]);
  const byDate = useMemo(() => new Map(items.map((e) => [e.date, e])), [items]);

  // Excepciones reales (cierres / horarios especiales).
  const realEvents: ExceptionEvent[] = useMemo(
    () =>
      items.map((ex) => {
        const label =
          ex.type === 'CLOSED'
            ? t('schedule:exceptions.closed')
            : `${ex.opensAt?.slice(0, 5) ?? ''}–${ex.closesAt?.slice(0, 5) ?? ''}`;
        return {
          id: ex.id,
          title: ex.description ? `${label} · ${ex.description}` : label,
          start: parseISODate(ex.date),
          end: parseISODate(ex.date),
          allDay: true as const,
          exception: ex
        };
      }),
    [items, t]
  );

  // Marcadores "No laboral" para los días del mes visible cuyo día de la semana no está en el horario
  // de atención (y que no tienen ya una excepción). Son virtuales: no se persisten.
  const nonWorkingEvents: ExceptionEvent[] = useMemo(() => {
    if (!workingDays) return [];
    return visibleGridDays(calDate)
      .filter((d) => !workingDays.has(dayOfWeekOf(d)))
      .map((d) => ({ d, iso: toISODate(d) }))
      .filter(({ iso }) => !byDate.has(iso))
      .map(({ d, iso }) => ({
        id: `nw-${iso}`,
        title: t('schedule:exceptions.nonWorking'),
        start: d,
        end: d,
        allDay: true as const,
        exception: null
      }));
  }, [workingDays, calDate, byDate, t]);

  const events = useMemo(() => [...nonWorkingEvents, ...realEvents], [nonWorkingEvents, realEvents]);

  // Clic en un día (o arrastre): abre el modal para marcarlo como día cerrado. Como solo se permite una
  // excepción por día, si ya tiene una se reemplaza (el detalle/eliminar se abre desde su evento).
  // Los días que ya son no laborables por el horario de atención no se pueden marcar (ya están cerrados).
  function onSelectSlot(slot: SlotInfo) {
    const selected = slot.slots ?? [];
    const markable = workingDays ? selected.filter((d) => workingDays.has(dayOfWeekOf(d))) : selected;
    if (markable.length === 0) {
      toast.info(t('schedule:exceptions.nonWorkingDayInfo'));
      return;
    }
    setCreateDates(markable.map(toISODate));
  }

  // "Cambiar" desde el detalle: cierra el detalle y abre el modal de marcado para esa fecha (reemplazo).
  function replaceFromDetail() {
    if (detailOf) {
      setCreateDates([detailOf.date]);
      setDetailOf(null);
    }
  }

  return (
    <div className="page">
      <PageHeader title={t('schedule:exceptions.title')} description={t('schedule:exceptions.calendarHint')} />

      <Card className="panel calendar-card">
        <div className="hc-exception-legend">
          <span><i style={{ background: TYPE_COLOR.CLOSED }} />{t('schedule:exceptions.closed')}</span>
          <span><i style={{ background: NONWORKING_COLOR }} />{t('schedule:exceptions.nonWorking')}</span>
        </div>
        <DataState loading={exceptions.loading} error={exceptions.error} onRetry={exceptions.reload}>
          <ExceptionCalendar
            events={events}
            date={calDate}
            onNavigate={setCalDate}
            onSelectSlot={onSelectSlot}
            onSelectEvent={setDetailOf}
          />
        </DataState>
      </Card>

      <ExceptionFormModal
        dates={createDates}
        existing={byDate}
        onClose={() => setCreateDates(null)}
        onCreated={exceptions.reload}
      />
      <ExceptionDetailModal
        exception={detailOf}
        onClose={() => setDetailOf(null)}
        onDeleted={exceptions.reload}
        onReplace={replaceFromDetail}
      />
    </div>
  );
}
