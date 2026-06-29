import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Button, TextField } from '../../components/ui';
import { useToast } from '../../components/feedback/toast';
import { schedulingApi } from '../../api/services';
import type { ScheduleExceptionResponse } from '../../api/types';
import { formatDate } from '../../lib/format';

type Props = {
  /** Días (ISO 'yyyy-MM-dd') a marcar. null = modal cerrado. */
  dates: string[] | null;
  /** Excepciones existentes por fecha. Si un día ya tiene una, se reemplaza (solo 1 por día). */
  existing: Map<string, ScheduleExceptionResponse>;
  onClose: () => void;
  onCreated: () => void;
};

/**
 * Marca uno o varios días como excepción: un día completo no laborable (cierre). El horario no se
 * solicita —la jornada se considera cerrada— solo un motivo opcional (festivo, vacaciones, etc.).
 */
export function ExceptionFormModal({ dates, existing, onClose, onCreated }: Props) {
  const { t, i18n } = useTranslation(['schedule', 'common']);
  const toast = useToast();
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reinicia el formulario cada vez que se abre con una nueva selección de días.
  useEffect(() => {
    if (dates) setDescription('');
  }, [dates]);

  const count = dates?.length ?? 0;
  const replacing = dates ? dates.filter((d) => existing.has(d)).length : 0;
  const title =
    count === 1 && dates
      ? t('schedule:exceptions.markOne', { date: formatDate(dates[0], i18n.language) })
      : t('schedule:exceptions.markMany', { count });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!dates || dates.length === 0) return;
    setSubmitting(true);
    try {
      // Solo se permite una excepción por día: si ya hay una, se elimina antes de crear la nueva.
      // La excepción es siempre un día cerrado (CLOSED); no se envían horas.
      const upsert = async (date: string) => {
        const prev = existing.get(date);
        if (prev) await schedulingApi.deleteException(prev.id);
        return schedulingApi.createException({
          date,
          type: 'CLOSED',
          description: description.trim() || undefined
        });
      };
      const results = await Promise.allSettled(dates.map(upsert));
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - ok;
      if (ok > 0) toast.success(t('schedule:exceptions.created', { count: ok }));
      if (failed > 0) toast.error(t('schedule:exceptions.createdFailed', { count: failed }));
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={dates !== null && count > 0}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="exception-form" disabled={submitting}>
            {submitting ? t('common:actions.saving') : t('schedule:exceptions.create')}
          </Button>
        </>
      }
    >
      <form id="exception-form" className="hc-form" onSubmit={submit}>
        <p className="hc-field-message">{t('schedule:exceptions.closedNote')}</p>
        {replacing > 0 ? (
          <p className="hc-field-message">{t('schedule:exceptions.replaceNote', { count: replacing })}</p>
        ) : null}
        <TextField
          label={t('schedule:exceptions.description')}
          hint={t('schedule:exceptions.descriptionHint')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
}
