import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { DataState } from '../../components/DataState';
import { Button, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { ApiError } from '../../api/http';
import { appointmentsApi } from '../../api/services';
import type { AppointmentResponse, AvailableSlot, RescheduleRequest } from '../../api/types';

type Props = {
  appointment: AppointmentResponse | null;
  serviceName: (id: string) => string;
  /** Cliente concreto: appointmentsApi (invitado) o tenantAppointmentsApi (establecimiento). */
  reschedule: (id: string, body: RescheduleRequest) => Promise<AppointmentResponse>;
  onClose: () => void;
  onDone: () => void;
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Reprograma eligiendo un horario DISPONIBLE real (evita el 409 por horas arbitrarias). */
export function RescheduleModal({ appointment, serviceName, reschedule, onClose, onDone }: Readonly<Props>) {
  const { t, i18n } = useTranslation(['appointments', 'common']);
  const toast = useToast();
  const open = appointment !== null;

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<AvailableSlot | null>(null);

  const [lastKey, setLastKey] = useState('');
  const key = `${open}-${appointment?.id ?? ''}`;
  if (key !== lastKey) {
    setLastKey(key);
    setDate('');
    setSlot(null);
  }

  const availability = useResource(
    () => (appointment && date ? appointmentsApi.availability(appointment.offeringId, date) : Promise.resolve(null)),
    [appointment?.offeringId, date]
  );
  const save = useMutation(() => reschedule(appointment!.id, { newSlotStart: slot!.start }));

  // Oculta los horarios que ya pasaron (relevante cuando la fecha elegida es hoy).
  const slots = (availability.data ?? []).filter((s) => new Date(s.start).getTime() > Date.now());
  const timeOf = (iso: string) => new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' }).format(new Date(iso));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!appointment || !slot) {
      toast.error(t('appointments:reschedule.pickSlot'));
      return;
    }
    try {
      await save.run();
      toast.success(t('appointments:toast.rescheduled'));
      onDone();
      onClose();
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 409 ? t('appointments:reschedule.conflict') : null;
      toast.error(msg ?? (err instanceof Error ? err.message : t('common:feedback.error')));
    }
  }

  return (
    <Modal
      open={open}
      title={t('appointments:reschedule.title', { service: appointment ? serviceName(appointment.offeringId) : '' })}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="reschedule-form" disabled={save.submitting || !slot}>
            {save.submitting ? t('common:actions.saving') : t('appointments:reschedule.submit')}
          </Button>
        </>
      }
    >
      <form id="reschedule-form" className="hc-form" onSubmit={submit}>
        <TextField
          label={t('appointments:reschedule.date')}
          hint={t('appointments:reschedule.dateHint')}
          type="date"
          min={todayISO()}
          required
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSlot(null);
          }}
        />
        {date ? (
          <div className="hc-field">
            <span className="hc-field-label">{t('appointments:reschedule.slots')}</span>
            <DataState
              loading={availability.loading}
              error={availability.error}
              empty={slots.length === 0}
              emptyMessage={t('appointments:reschedule.noSlots')}
              onRetry={availability.reload}
            >
              <div className="slot-grid">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    className={`slot ${slot?.start === s.start ? 'slot-active' : ''}`.trim()}
                    onClick={() => setSlot(s)}
                  >
                    {timeOf(s.start)}
                  </button>
                ))}
              </div>
            </DataState>
          </div>
        ) : null}
        {save.error ? <p className="login-error">{save.error.message}</p> : null}
      </form>
    </Modal>
  );
}
