import { useEffect, useState, type FormEvent } from 'react';
import { CalendarClock, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Select, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { schedulingApi } from '../../api/services';
import type { BusinessHoursDto, DayOfWeek, ScheduleExceptionResponse } from '../../api/types';
import { formatDate } from '../../lib/format';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

type DayRow = { enabled: boolean; opensAt: string; closesAt: string };

function buildRows(hours: BusinessHoursDto[] | null): Record<DayOfWeek, DayRow> {
  const base = Object.fromEntries(
    DAYS.map((d) => [d, { enabled: false, opensAt: '09:00', closesAt: '17:00' }])
  ) as Record<DayOfWeek, DayRow>;
  (hours ?? []).forEach((h) => {
    base[h.dayOfWeek] = { enabled: true, opensAt: h.opensAt?.slice(0, 5) ?? '09:00', closesAt: h.closesAt?.slice(0, 5) ?? '17:00' };
  });
  return base;
}

export function SchedulePage() {
  const { t, i18n } = useTranslation(['schedule', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const hours = useResource(() => schedulingApi.getHours(), []);
  const exceptions = useResource(() => schedulingApi.listExceptions({ size: 100, sort: 'date,asc' }), []);

  const [rows, setRows] = useState<Record<DayOfWeek, DayRow>>(() => buildRows(null));
  useEffect(() => {
    if (hours.data) setRows(buildRows(hours.data));
  }, [hours.data]);

  const saveHours = useMutation((body: BusinessHoursDto[]) => schedulingApi.saveHours({ hours: body }));

  async function submitHours() {
    const enabledDays = DAYS.filter((d) => rows[d].enabled);
    // Validación: la hora de apertura debe ser anterior a la de cierre (comparación HH:MM segura).
    const badDay = enabledDays.find((d) => rows[d].opensAt >= rows[d].closesAt);
    if (badDay) {
      toast.error(t('schedule:hours.invalidRange', { day: t(`common:days.${badDay}`) }));
      return;
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
    const payload: BusinessHoursDto[] = enabledDays.map((d) => ({
      dayOfWeek: d,
      opensAt: rows[d].opensAt,
      closesAt: rows[d].closesAt
    }));
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
      <PageHeader eyebrow={t('schedule:eyebrow')} title={t('schedule:title')} description={t('schedule:description')} />

      <div className="page-grid-2">
        <Card className="panel">
          <div className="panel-heading">
            <CalendarClock size={20} />
            <h2>{t('schedule:hours.title')}</h2>
          </div>
          <DataState loading={hours.loading} error={hours.error} onRetry={hours.reload}>
            <div className="hours-grid">
              {DAYS.map((d) => (
                <div className={`hours-row ${rows[d].enabled ? '' : 'hours-row-off'}`} key={d}>
                  <label className="hc-checkbox hours-day">
                    <input
                      type="checkbox"
                      checked={rows[d].enabled}
                      onChange={(e) => setRows((r) => ({ ...r, [d]: { ...r[d], enabled: e.target.checked } }))}
                    />
                    <span>{t(`common:days.${d}`)}</span>
                  </label>
                  <input
                    type="time"
                    className="hc-time"
                    disabled={!rows[d].enabled}
                    value={rows[d].opensAt}
                    onChange={(e) => setRows((r) => ({ ...r, [d]: { ...r[d], opensAt: e.target.value } }))}
                  />
                  <span className="hours-sep">–</span>
                  <input
                    type="time"
                    className="hc-time"
                    disabled={!rows[d].enabled}
                    value={rows[d].closesAt}
                    onChange={(e) => setRows((r) => ({ ...r, [d]: { ...r[d], closesAt: e.target.value } }))}
                  />
                </div>
              ))}
            </div>
            {saveHours.error ? <p className="login-error">{saveHours.error.message}</p> : null}
            <div className="panel-actions">
              <Button icon={<Save size={17} />} onClick={submitHours} disabled={saveHours.submitting}>
                {saveHours.submitting ? t('common:actions.saving') : t('schedule:hours.save')}
              </Button>
            </div>
          </DataState>
        </Card>

        <ExceptionsPanel
          loading={exceptions.loading}
          error={exceptions.error}
          items={exceptions.data?.content ?? []}
          onReload={exceptions.reload}
          locale={i18n.language}
        />
      </div>
    </div>
  );
}

function ExceptionsPanel({
  loading,
  error,
  items,
  onReload,
  locale
}: {
  loading: boolean;
  error: Error | null;
  items: ScheduleExceptionResponse[];
  onReload: () => void;
  locale: string;
}) {
  const { t } = useTranslation(['schedule', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState({ date: '', type: 'CLOSED', opensAt: '09:00', closesAt: '17:00', description: '' });
  const create = useMutation(() =>
    schedulingApi.createException({
      date: form.date,
      type: form.type,
      opensAt: form.type === 'SPECIAL_HOURS' ? form.opensAt : undefined,
      closesAt: form.type === 'SPECIAL_HOURS' ? form.closesAt : undefined,
      description: form.description.trim() || undefined
    })
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    // En horario especial, la apertura debe ser anterior al cierre.
    if (form.type === 'SPECIAL_HOURS' && form.opensAt >= form.closesAt) {
      toast.error(t('schedule:exceptions.invalidRange'));
      return;
    }
    try {
      await create.run();
      toast.success(t('schedule:toast.exceptionAdded'));
      setForm((f) => ({ ...f, date: '', description: '' }));
      onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  async function remove(id: string) {
    const ok = await confirm({
      title: t('schedule:confirm.deleteExceptionTitle'),
      message: t('schedule:confirm.deleteExceptionMessage'),
      confirmLabel: t('common:actions.delete'),
      danger: true
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await schedulingApi.deleteException(id);
      toast.success(t('common:feedback.deleted'));
      onReload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="panel">
      <div className="panel-heading">
        <CalendarClock size={20} />
        <h2>{t('schedule:exceptions.title')}</h2>
      </div>

      <form className="hc-form exception-form" onSubmit={submit}>
        <div className="hc-form-row">
          <TextField
            label={t('schedule:exceptions.date')}
            hint={t('schedule:exceptions.dateHint')}
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Select
            label={t('schedule:exceptions.type')}
            hint={t('schedule:exceptions.typeHint')}
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            options={[
              { value: 'CLOSED', label: t('schedule:exceptions.closed') },
              { value: 'SPECIAL_HOURS', label: t('schedule:exceptions.customHours') }
            ]}
          />
        </div>
        {form.type === 'SPECIAL_HOURS' ? (
          <div className="hc-form-row">
            <TextField
              label={t('schedule:exceptions.opensAt')}
              type="time"
              value={form.opensAt}
              onChange={(e) => setForm((f) => ({ ...f, opensAt: e.target.value }))}
            />
            <TextField
              label={t('schedule:exceptions.closesAt')}
              type="time"
              value={form.closesAt}
              onChange={(e) => setForm((f) => ({ ...f, closesAt: e.target.value }))}
            />
          </div>
        ) : null}
        <TextField
          label={t('schedule:exceptions.description')}
          hint={t('schedule:exceptions.descriptionHint')}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        {create.error ? <p className="login-error">{create.error.message}</p> : null}
        <div className="panel-actions">
          <Button type="submit" icon={<Plus size={17} />} disabled={create.submitting || !form.date}>
            {t('schedule:exceptions.add')}
          </Button>
        </div>
      </form>

      <DataState loading={loading} error={error} empty={items.length === 0} emptyMessage={t('schedule:exceptions.empty')} onRetry={onReload}>
        <ul className="exception-list">
          {items.map((ex) => (
            <li key={ex.id}>
              <div>
                <strong>{formatDate(ex.date, locale)}</strong>
                <Badge tone={ex.type === 'CLOSED' ? 'danger' : 'info'}>
                  {ex.type === 'CLOSED'
                    ? t('schedule:exceptions.closed')
                    : `${ex.opensAt?.slice(0, 5) ?? ''}–${ex.closesAt?.slice(0, 5) ?? ''}`}
                </Badge>
                {ex.description ? <span className="exception-desc">{ex.description}</span> : null}
              </div>
              <button
                className="hc-icon-button"
                type="button"
                onClick={() => remove(ex.id)}
                disabled={busyId === ex.id}
                aria-label={t('common:actions.delete')}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </DataState>
    </Card>
  );
}
