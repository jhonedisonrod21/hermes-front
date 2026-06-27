import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { DataState } from '../../components/DataState';
import { Button, Select, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { useAuth } from '../../hermes-security/useAuth';
import { paymentApi } from '../../api/services';
import type { AppointmentResponse } from '../../api/types';

const LEGAL_TYPES = ['NATURAL', 'JURIDICAL'];
const DOC_TYPES = ['CC', 'CE', 'NIT', 'PP'];

type Props = {
  appointment: AppointmentResponse | null;
  serviceName: (id: string) => string;
  onClose: () => void;
};

export function PaymentModal({ appointment, serviceName, onClose }: Props) {
  const { t } = useTranslation(['bookings', 'common']);
  const toast = useToast();
  const { session } = useAuth();
  const open = appointment !== null;

  const banks = useResource(
    () => (appointment ? paymentApi.banks(appointment.id) : Promise.resolve(null)),
    [appointment?.id]
  );
  const [form, setForm] = useState({
    bank: '',
    legalType: 'NATURAL',
    documentType: 'CC',
    documentNumber: '',
    fullName: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Prefill con los datos de sesión al abrir.
  const [lastId, setLastId] = useState<string | null>(null);
  if (appointment && appointment.id !== lastId) {
    setLastId(appointment.id);
    // El "nombre completo" no debe rellenarse con un correo/usuario tipo email:
    // solo se precarga si el usuario tiene un nombre de usuario que no parezca un correo.
    const username = session?.profile?.preferred_username ?? '';
    setForm((f) => ({
      ...f,
      bank: '',
      email: session?.profile?.email ?? '',
      fullName: username.includes('@') ? '' : username
    }));
  }

  const checkout = useMutation(() =>
    paymentApi.checkout({
      appointmentId: appointment!.id,
      financialInstitutionCode: form.bank,
      payer: {
        legalType: form.legalType,
        documentType: form.documentType,
        documentNumber: form.documentNumber.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim()
      }
    })
  );

  const set = (k: keyof typeof form, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const bankItems = banks.data ?? [];

  function validate(): Record<string, string | undefined> {
    const e: Record<string, string | undefined> = {};
    if (!/^\d+$/.test(form.documentNumber.trim())) e.documentNumber = t('bookings:pay.documentNumberInvalid');
    if (!form.fullName.trim()) e.fullName = t('common:validation.required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t('common:validation.email');
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) e.phone = t('bookings:pay.phoneInvalid');
    return e;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!appointment || !form.bank) {
      toast.error(t('bookings:pay.pickBank'));
      return;
    }
    const found = validate();
    const firstBad = Object.keys(found).find((k) => found[k]);
    if (firstBad) {
      setErrors(found);
      requestAnimationFrame(() => document.getElementById(`pay-${firstBad}`)?.focus());
      return;
    }
    setErrors({});
    try {
      const res = await checkout.run();
      // Redirige a la pasarela PSE para completar el pago.
      window.location.assign(res.checkoutUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  return (
    <Modal
      open={open}
      title={t('bookings:pay.title', { service: appointment ? serviceName(appointment.offeringId) : '' })}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={checkout.submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="payment-form" variant="accent" disabled={checkout.submitting || !form.bank}>
            {checkout.submitting ? t('bookings:pay.processing') : t('bookings:pay.submit')}
          </Button>
        </>
      }
    >
      <form id="payment-form" className="hc-form" onSubmit={submit}>
        <DataState
          loading={banks.loading}
          error={banks.error ? new Error(t('bookings:pay.unavailable')) : null}
          onRetry={banks.reload}
        >
          <Select
            label={t('bookings:pay.bank')}
            hint={t('bookings:pay.bankHint')}
            value={form.bank}
            onChange={(e) => set('bank', e.target.value)}
            placeholder={t('bookings:pay.pickBank')}
            options={bankItems.map((b) => ({ value: b.code, label: b.name }))}
          />
        </DataState>

        <div className="hc-form-row">
          <Select
            label={t('bookings:pay.legalType')}
            value={form.legalType}
            onChange={(e) => set('legalType', e.target.value)}
            options={LEGAL_TYPES.map((v) => ({ value: v, label: t(`bookings:pay.legal.${v}`) }))}
          />
          <Select
            label={t('bookings:pay.documentType')}
            value={form.documentType}
            onChange={(e) => set('documentType', e.target.value)}
            options={DOC_TYPES.map((v) => ({ value: v, label: v }))}
          />
          <TextField
            id="pay-documentNumber"
            label={t('bookings:pay.documentNumber')}
            hint={t('bookings:pay.documentNumberHint')}
            inputMode="numeric"
            error={errors.documentNumber}
            value={form.documentNumber}
            onChange={(e) => set('documentNumber', e.target.value)}
          />
        </div>

        <TextField
          id="pay-fullName"
          label={t('bookings:pay.fullName')}
          hint={t('bookings:pay.fullNameHint')}
          error={errors.fullName}
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
        />
        <div className="hc-form-row">
          <TextField
            id="pay-email"
            label={t('bookings:pay.email')}
            hint={t('bookings:pay.emailHint')}
            type="email"
            error={errors.email}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <TextField
            id="pay-phone"
            label={t('bookings:pay.phone')}
            hint={t('bookings:pay.phoneHint')}
            inputMode="tel"
            error={errors.phone}
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>

        {checkout.error ? <p className="login-error">{checkout.error.message}</p> : null}
      </form>
    </Modal>
  );
}
