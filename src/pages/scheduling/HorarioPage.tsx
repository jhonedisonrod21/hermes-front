import { useEffect, useState } from 'react';
import { Clock, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Button, Card } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { schedulingApi } from '../../api/services';
import type { BusinessHoursDto, DayOfWeek } from '../../api/types';
import { HoursDialog, type Slot } from './HoursDialog';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

type DayRow = { enabled: boolean; slots: Slot[] };

/** Horario por defecto que muestran todas las baldosas: 8:00 a 17:00. */
const defaultSlot = (): Slot => ({ opensAt: '08:00', closesAt: '17:00' });

/** Agrupa las franjas del backend por día (un día puede tener varias franjas). */
function buildRows(hours: BusinessHoursDto[] | null): Record<DayOfWeek, DayRow> {
  const base = Object.fromEntries(
    DAYS.map((d) => [d, { enabled: false, slots: [defaultSlot()] }])
  ) as Record<DayOfWeek, DayRow>;
  const byDay = new Map<DayOfWeek, Slot[]>();
  (hours ?? []).forEach((h) => {
    const list = byDay.get(h.dayOfWeek) ?? [];
    list.push({ opensAt: h.opensAt?.slice(0, 5) ?? '08:00', closesAt: h.closesAt?.slice(0, 5) ?? '17:00' });
    byDay.set(h.dayOfWeek, list);
  });
  byDay.forEach((slots, day) => {
    slots.sort((a, b) => a.opensAt.localeCompare(b.opensAt));
    base[day] = { enabled: true, slots };
  });
  return base;
}

/** Horario semanal de atención: una baldosa por día; el detalle se edita en un diálogo. */
export function HorarioPage() {
  const { t } = useTranslation(['schedule', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const hours = useResource(() => schedulingApi.getHours(), []);

  const [rows, setRows] = useState<Record<DayOfWeek, DayRow>>(() => buildRows(null));
  const [editDay, setEditDay] = useState<DayOfWeek | null>(null);
  useEffect(() => {
    if (hours.data) setRows(buildRows(hours.data));
  }, [hours.data]);

  const saveHours = useMutation((body: BusinessHoursDto[]) => schedulingApi.saveHours({ hours: body }));

  const toggleDay = (d: DayOfWeek, enabled: boolean) =>
    setRows((r) => ({ ...r, [d]: { ...r[d], enabled, slots: r[d].slots.length ? r[d].slots : [defaultSlot()] } }));

  const saveDaySlots = (d: DayOfWeek, slots: Slot[]) =>
    setRows((r) => ({ ...r, [d]: { ...r[d], slots } }));

  async function submitHours() {
    const enabledDays = DAYS.filter((d) => rows[d].enabled);
    // Validación por día: cada franja con apertura < cierre y sin solaparse con otra del mismo día.
    for (const d of enabledDays) {
      const slots = [...rows[d].slots].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
      if (slots.some((s) => s.opensAt >= s.closesAt)) {
        toast.error(t('schedule:hours.invalidRange', { day: t(`common:days.${d}`) }));
        return;
      }
      for (let i = 1; i < slots.length; i++) {
        if (slots[i].opensAt < slots[i - 1].closesAt) {
          toast.error(t('schedule:hours.overlap', { day: t(`common:days.${d}`) }));
          return;
        }
      }
    }
    // Guardar 0 días deja la agenda totalmente cerrada: confirmar antes.
    if (enabledDays.length === 0) {
      const ok = await confirm({
        title: t('schedule:hours.noneTitle'),
        message: t('schedule:hours.noneMessage'),
        confirmLabel: t('schedule:hours.save'),
        danger: true
      });
      if (!ok) return;
    }
    const payload: BusinessHoursDto[] = enabledDays.flatMap((d) =>
      rows[d].slots.map((s) => ({ dayOfWeek: d, opensAt: s.opensAt, closesAt: s.closesAt }))
    );
    try {
      await saveHours.run(payload);
      toast.success(t('schedule:toast.hoursSaved'));
      hours.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  return (
    <div className="page">
      <PageHeader
        title={t('schedule:hours.title')}
        description={t('schedule:description')}
        actions={
          <Button icon={<Save size={17} />} onClick={submitHours} disabled={saveHours.submitting}>
            {saveHours.submitting ? t('common:actions.saving') : t('schedule:hours.save')}
          </Button>
        }
      />

      <Card className="panel">
        <DataState loading={hours.loading} error={hours.error} onRetry={hours.reload}>
          <div className="hours-grid">
            {DAYS.map((d) => {
              const row = rows[d];
              return (
                <div className={`hours-tile ${row.enabled ? '' : 'is-off'}`} key={d}>
                  <div className="hours-tile-head">
                    <span className="hours-tile-day">{t(`common:days.${d}`)}</span>
                    <input
                      type="checkbox"
                      className="hours-tile-check"
                      checked={row.enabled}
                      aria-label={t(`common:days.${d}`)}
                      onChange={(e) => toggleDay(d, e.target.checked)}
                    />
                  </div>

                  <div className="hours-tile-slots">
                    {row.slots.map((s, i) => (
                      <span className="hours-line" key={i}>
                        <Clock size={13} /> {s.opensAt} – {s.closesAt}
                      </span>
                    ))}
                  </div>

                  {row.enabled ? (
                    <button type="button" className="hours-modify" onClick={() => setEditDay(d)}>
                      {t('schedule:hours.modify')}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          {saveHours.error ? <p className="login-error">{saveHours.error.message}</p> : null}
        </DataState>
      </Card>

      <HoursDialog
        key={editDay ?? 'closed'}
        day={editDay}
        initialSlots={editDay ? rows[editDay].slots : []}
        onClose={() => setEditDay(null)}
        onSave={(slots) => editDay && saveDaySlots(editDay, slots)}
      />
    </div>
  );
}
