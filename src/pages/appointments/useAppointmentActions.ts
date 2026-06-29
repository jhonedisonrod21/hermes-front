import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { tenantAppointmentsApi } from '../../api/services';
import type { AppointmentResponse } from '../../api/types';

/**
 * Acciones terminales sobre una cita (cancelar / completar / marcar no presentado), con su diálogo de
 * confirmación, toast y recarga. Compartidas por la vista lista y la vista calendario.
 * @param reload callback que refresca la fuente de datos de la vista que invoca la acción.
 */
export function useAppointmentActions(reload: () => void) {
  const { t } = useTranslation(['appointments', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const [busyId, setBusyId] = useState<string | null>(null);

  /** @returns true si la operación se ejecutó con éxito (para que el llamador pueda, p. ej., cerrar un modal). */
  async function run(a: AppointmentResponse, op: (id: string) => Promise<unknown>, successKey: string) {
    setBusyId(a.id);
    try {
      await op(a.id);
      toast.success(t(successKey));
      reload();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function cancel(a: AppointmentResponse) {
    const ok = await confirm({
      title: t('appointments:confirm.cancelTitle'),
      message: t('appointments:confirm.cancelMessage'),
      confirmLabel: t('appointments:confirm.cancelConfirm'),
      cancelLabel: t('common:actions.back'),
      danger: true
    });
    if (ok) await run(a, tenantAppointmentsApi.cancel, 'appointments:toast.cancelled');
  }

  async function complete(a: AppointmentResponse) {
    const ok = await confirm({
      title: t('appointments:confirm.completeTitle'),
      message: t('appointments:confirm.completeMessage'),
      confirmLabel: t('appointments:actions.complete')
    });
    return ok ? run(a, tenantAppointmentsApi.complete, 'appointments:toast.completed') : false;
  }

  async function markNoShow(a: AppointmentResponse) {
    const ok = await confirm({
      title: t('appointments:confirm.noShowTitle'),
      message: t('appointments:confirm.noShowMessage'),
      confirmLabel: t('appointments:actions.noShow'),
      danger: true
    });
    return ok ? run(a, tenantAppointmentsApi.noShow, 'appointments:toast.noShow') : false;
  }

  return { busyId, cancel, complete, markNoShow };
}
