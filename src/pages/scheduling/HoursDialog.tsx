import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/ui';
import { useToast } from '../../components/feedback/toast';
import type { DayOfWeek } from '../../api/types';

export type Slot = { opensAt: string; closesAt: string };

type Props = {
  /** Día que se está editando; null = diálogo cerrado. */
  day: DayOfWeek | null;
  initialSlots: Slot[];
  onClose: () => void;
  onSave: (slots: Slot[]) => void;
};

/**
 * Diálogo para definir una o varias franjas horarias de un día. Edita una copia local; al guardar
 * valida (apertura < cierre y sin solapes) y devuelve las franjas ordenadas al contenedor.
 * Debe montarse con `key={day}` para reinicializar al cambiar de día.
 */
export function HoursDialog({ day, initialSlots, onClose, onSave }: Props) {
  const { t } = useTranslation(['schedule', 'common']);
  const toast = useToast();
  const [slots, setSlots] = useState<Slot[]>(() =>
    initialSlots.length ? initialSlots : [{ opensAt: '08:00', closesAt: '17:00' }]
  );

  const update = (i: number, field: keyof Slot, value: string) =>
    setSlots((s) => s.map((sl, idx) => (idx === i ? { ...sl, [field]: value } : sl)));
  const add = () => setSlots((s) => [...s, { opensAt: '14:00', closesAt: '18:00' }]);
  const remove = (i: number) => setSlots((s) => s.filter((_, idx) => idx !== i));

  function save() {
    const sorted = [...slots].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
    const dayLabel = day ? t(`common:days.${day}`) : '';
    if (sorted.some((s) => s.opensAt >= s.closesAt)) {
      toast.error(t('schedule:hours.invalidRange', { day: dayLabel }));
      return;
    }
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].opensAt < sorted[i - 1].closesAt) {
        toast.error(t('schedule:hours.overlap', { day: dayLabel }));
        return;
      }
    }
    onSave(sorted);
    onClose();
  }

  return (
    <Modal
      open={day !== null}
      title={day ? t('schedule:hours.modifyTitle', { day: t(`common:days.${day}`) }) : ''}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button onClick={save}>{t('common:actions.save')}</Button>
        </>
      }
    >
      <div className="hc-form">
        <p className="hc-field-message">{t('schedule:hours.modifyHint')}</p>
        {slots.map((s, i) => (
          <div className="hours-slot" key={i}>
            <input type="time" className="hc-time" value={s.opensAt} onChange={(e) => update(i, 'opensAt', e.target.value)} />
            <span className="hours-sep">–</span>
            <input type="time" className="hc-time" value={s.closesAt} onChange={(e) => update(i, 'closesAt', e.target.value)} />
            {slots.length > 1 ? (
              <button
                type="button"
                className="hc-icon-button hours-slot-remove"
                aria-label={t('schedule:hours.removeSlot')}
                title={t('schedule:hours.removeSlot')}
                onClick={() => remove(i)}
              >
                <X size={15} />
              </button>
            ) : null}
          </div>
        ))}
        <button type="button" className="hours-add" onClick={add}>
          <Plus size={15} /> {t('schedule:hours.addSlot')}
        </button>
      </div>
    </Modal>
  );
}
