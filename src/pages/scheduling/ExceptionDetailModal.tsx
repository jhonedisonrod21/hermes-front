import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Badge, Button } from '../../components/ui';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { schedulingApi } from '../../api/services';
import type { ScheduleExceptionResponse, ScheduleExceptionType } from '../../api/types';
import { formatDate } from '../../lib/format';
import { TYPE_TONE } from './exceptionMeta';

type Props = {
  exception: ScheduleExceptionResponse | null;
  onClose: () => void;
  onDeleted: () => void;
  /** Abre el modal de marcado para esta misma fecha (reemplaza la excepción: solo 1 por día). */
  onReplace: () => void;
};

/** Detalle de una excepción existente, con opción de cambiarla (reemplazar) o eliminarla. */
export function ExceptionDetailModal({ exception, onClose, onDeleted, onReplace }: Props) {
  const { t, i18n } = useTranslation(['schedule', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const ex = exception;

  async function remove() {
    if (!ex) return;
    const ok = await confirm({
      title: t('schedule:confirm.deleteExceptionTitle'),
      message: t('schedule:confirm.deleteExceptionMessage'),
      confirmLabel: t('common:actions.delete'),
      danger: true
    });
    if (!ok) return;
    setBusy(true);
    try {
      await schedulingApi.deleteException(ex.id);
      toast.success(t('common:feedback.deleted'));
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={ex !== null}
      title={t('schedule:exceptions.detailTitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {t('common:actions.close')}
          </Button>
          <Button variant="secondary" icon={<Pencil size={16} />} onClick={onReplace} disabled={busy}>
            {t('schedule:exceptions.change')}
          </Button>
          <Button variant="danger" icon={<Trash2 size={16} />} onClick={remove} disabled={busy}>
            {t('common:actions.delete')}
          </Button>
        </>
      }
    >
      {ex ? (
        <dl className="hc-detail">
          <div>
            <dt>{t('schedule:exceptions.date')}</dt>
            <dd><strong>{formatDate(ex.date, i18n.language)}</strong></dd>
          </div>
          {/* Un día no laboral (CLOSED) no necesita más detalle de tipo: el título ya lo indica.
              El bloque de tipo/horas solo aplica a datos antiguos de "horario especial". */}
          {ex.type === 'SPECIAL_HOURS' ? (
            <>
              <div>
                <dt>{t('schedule:exceptions.type')}</dt>
                <dd>
                  <Badge tone={TYPE_TONE[ex.type as ScheduleExceptionType]}>
                    {t('schedule:exceptions.customHours')}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt>{t('schedule:exceptions.hours')}</dt>
                <dd>{`${ex.opensAt?.slice(0, 5) ?? ''} – ${ex.closesAt?.slice(0, 5) ?? ''}`}</dd>
              </div>
            </>
          ) : null}
          {ex.description ? (
            <div>
              <dt>{t('schedule:exceptions.description')}</dt>
              <dd>{ex.description}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </Modal>
  );
}
