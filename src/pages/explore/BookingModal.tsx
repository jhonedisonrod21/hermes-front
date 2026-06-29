import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { DataState } from '../../components/DataState';
import { Button, Checkbox, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { appointmentsApi } from '../../api/services';
import type { AvailableSlot, OfferingSearchResult } from '../../api/types';
import { formatMoney } from '../../lib/format';

type Props = {
  offering: OfferingSearchResult | null;
  onClose: () => void;
};

function todayISO() {
  // Fecha local de hoy en formato YYYY-MM-DD para el min del selector.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BookingModal({ offering, onClose }: Readonly<Props>) {
  const { t, i18n } = useTranslation(['bookings', 'catalog', 'common']);
  const toast = useToast();
  const navigate = useNavigate();
  const open = offering !== null;

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  // Anexos de archivo (tipo FILE): valor = fileId subido; guardamos también el nombre y si está subiendo.
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  // Reinicia el estado al abrir o cambiar de servicio.
  const [lastKey, setLastKey] = useState('');
  const key = `${open}-${offering?.id ?? ''}`;
  if (key !== lastKey) {
    setLastKey(key);
    setDate('');
    setSlot(null);
    setValues({});
    setFieldErrors({});
    setUploading({});
    setFileNames({});
  }

  const availability = useResource(
    () => (offering && date ? appointmentsApi.availability(offering.id, date) : Promise.resolve(null)),
    [offering?.id, date]
  );
  const book = useMutation(() =>
    appointmentsApi.book({ offeringId: offering!.id, slotStart: slot!.start, requirementValues: values })
  );

  // Oculta los horarios que ya pasaron (relevante cuando la fecha elegida es hoy).
  const slots = (availability.data ?? []).filter((s) => new Date(s.start).getTime() > Date.now());
  const requirements = offering?.requirements ?? [];

  const setVal = (k: string, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setFieldErrors((e) => ({ ...e, [k]: undefined }));
  };
  const anyUploading = Object.values(uploading).some(Boolean);

  // Sube el anexo de un requisito FILE y guarda el fileId como su valor (lo consume la reserva).
  async function handleFile(k: string, file: File | undefined) {
    if (!file) return;
    // Solo PDF: el visor de anexos (ver/descargar/imprimir) trabaja con PDF.
    if (file.type !== 'application/pdf') {
      setFieldErrors((e) => ({ ...e, [k]: t('bookings:book.onlyPdf') }));
      return;
    }
    setUploading((u) => ({ ...u, [k]: true }));
    setFieldErrors((e) => ({ ...e, [k]: undefined }));
    try {
      const res = await appointmentsApi.uploadRequirementFile(file);
      setValues((s) => ({ ...s, [k]: res.fileId }));
      setFileNames((n) => ({ ...n, [k]: res.filename }));
    } catch (err) {
      setValues((s) => ({ ...s, [k]: '' }));
      setFileNames((n) => ({ ...n, [k]: '' }));
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setUploading((u) => ({ ...u, [k]: false }));
    }
  }
  const timeOf = (iso: string) => new Intl.DateTimeFormat(i18n.language, { timeStyle: 'short' }).format(new Date(iso));
  // Ayuda según el tipo del requisito (los requisitos no traen descripción propia del backend).
  const reqHint = (type: string): string | undefined => {
    if (type === 'NUMBER') return t('bookings:book.typeHint.NUMBER');
    if (type === 'DATE') return t('bookings:book.typeHint.DATE');
    if (type === 'FILE') return t('bookings:book.typeHint.FILE');
    return undefined;
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!offering || !slot) {
      toast.error(t('bookings:book.pickSlot'));
      return;
    }
    const missing = requirements.filter((r) => r.required && !(values[r.key] ?? '').trim());
    if (missing.length > 0) {
      const errs: Record<string, string> = {};
      missing.forEach((r) => {
        errs[r.key] = t('common:validation.required');
      });
      setFieldErrors(errs);
      // Lleva el foco al primer campo obligatorio que falta.
      requestAnimationFrame(() => document.getElementById(missing[0].key)?.focus());
      return;
    }
    setFieldErrors({});
    try {
      await book.run();
      toast.success(t('bookings:book.booked'));
      onClose();
      navigate('/mis-reservas');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  return (
    <Modal
      open={open}
      title={t('bookings:book.title', { service: offering?.name ?? '' })}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={book.submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="booking-form" disabled={book.submitting || !slot || anyUploading}>
            {book.submitting ? t('bookings:book.booking') : t('bookings:book.confirm')}
          </Button>
        </>
      }
    >
      <form id="booking-form" className="hc-form" onSubmit={submit}>
        {offering ? (
          <p className="booking-summary">
            {offering.tenantName ? <span>{offering.tenantName} · </span> : null}
            {formatMoney(offering.priceAmount, offering.priceCurrency, i18n.language)}
            {offering.requiresOnlinePayment ? ` · ${t('bookings:book.paymentNote')}` : ''}
          </p>
        ) : null}

        <TextField
          label={t('bookings:book.date')}
          hint={t('bookings:book.dateHint')}
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
            <span className="hc-field-label">{t('bookings:book.slots')}</span>
            <DataState
              loading={availability.loading}
              error={availability.error}
              empty={slots.length === 0}
              emptyMessage={t('bookings:book.noSlots')}
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

        {requirements.length > 0 ? (
          <div className="hc-form">
            <span className="hc-field-label">{t('bookings:book.requirements')}</span>
            {requirements.map((r) =>
              r.type === 'BOOLEAN' ? (
                <Checkbox
                  key={r.key}
                  label={r.required ? `${r.label} *` : r.label}
                  checked={values[r.key] === 'true'}
                  onChange={(e) => setVal(r.key, e.target.checked ? 'true' : 'false')}
                />
              ) : r.type === 'FILE' ? (
                <div className="hc-field" key={r.key}>
                  <label className="hc-field-label" htmlFor={r.key}>
                    {r.required ? `${r.label} *` : r.label}
                  </label>
                  <input
                    id={r.key}
                    name={r.key}
                    type="file"
                    accept="application/pdf"
                    className="hc-file-input"
                    disabled={uploading[r.key]}
                    onChange={(e) => handleFile(r.key, e.target.files?.[0])}
                  />
                  {uploading[r.key] ? (
                    <p className="hc-field-message">{t('bookings:book.uploading')}</p>
                  ) : fileNames[r.key] ? (
                    <p className="hc-field-message">{t('bookings:book.fileReady', { name: fileNames[r.key] })}</p>
                  ) : (
                    <p className="hc-field-message">{reqHint('FILE')}</p>
                  )}
                  {fieldErrors[r.key] ? <p className="hc-field-message hc-field-error">{fieldErrors[r.key]}</p> : null}
                </div>
              ) : (
                <TextField
                  key={r.key}
                  name={r.key}
                  label={r.required ? `${r.label} *` : r.label}
                  hint={reqHint(r.type)}
                  error={fieldErrors[r.key]}
                  type={r.type === 'NUMBER' ? 'number' : r.type === 'DATE' ? 'date' : 'text'}
                  value={values[r.key] ?? ''}
                  onChange={(e) => setVal(r.key, e.target.value)}
                />
              )
            )}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
