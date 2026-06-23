import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Button, Checkbox, DatalistField, Select, Textarea, TextField } from '../../components/ui';
import { useMutation } from '../../hooks/useMutation';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../components/feedback/toast';
import { currencyOptions } from '../../lib/currencies';
import { ApiError } from '../../api/http';
import { catalogApi, paymentApi } from '../../api/services';
import type { OfferingRequest, OfferingResponse, RequirementDto } from '../../api/types';

const MODALITIES = ['IN_PERSON', 'VIRTUAL', 'BOTH'];
const REQUIREMENT_TYPES = ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'FILE'];

type Props = {
  open: boolean;
  editing: OfferingResponse | null;
  /** Categorías existentes para sugerir en el autocompletado. */
  categories?: string[];
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  modality: string;
  priceAmount: number;
  priceCurrency: string;
  requiresOnlinePayment: boolean;
  requirements: RequirementDto[];
};

function toForm(o: OfferingResponse | null): FormState {
  return {
    name: o?.name ?? '',
    description: o?.description ?? '',
    category: o?.category ?? '',
    durationMinutes: o?.durationMinutes ?? 30,
    modality: o?.modality ?? 'IN_PERSON',
    priceAmount: o?.priceAmount ?? 0,
    priceCurrency: o?.priceCurrency ?? 'COP',
    requiresOnlinePayment: o?.requiresOnlinePayment ?? false,
    requirements: o?.requirements?.map((r) => ({ ...r })) ?? []
  };
}

function slugifyKey(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function OfferingFormModal({ open, editing, categories = [], onClose, onSaved }: Props) {
  const { t, i18n } = useTranslation(['catalog', 'common']);
  const toast = useToast();
  const currencies = useMemo(() => currencyOptions(i18n.language), [i18n.language]);
  const [form, setForm] = useState<FormState>(() => toForm(editing));
  const save = useMutation((body: OfferingRequest) =>
    editing ? catalogApi.updateOffering(editing.id, body) : catalogApi.createOffering(body)
  );
  // Estado de la configuración de cobro del tenant: 404 => aún no configurada.
  const paymentConfig = useResource(
    () => paymentApi.getMyConfig().catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
    []
  );
  // Cobrar por adelantado exige tener los pagos configurados Y activados.
  const paymentsReady = Boolean(paymentConfig.data?.enabled);
  const blockedByPayments = form.requiresOnlinePayment && !paymentConfig.loading && !paymentsReady;

  // Reinicia el formulario cuando cambia el registro en edición o se reabre el modal.
  const [lastKey, setLastKey] = useState<string>('');
  const key = `${open}-${editing?.id ?? 'new'}`;
  if (key !== lastKey) {
    setLastKey(key);
    setForm(toForm(editing));
    save.reset();
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function setRequirement(index: number, patch: Partial<RequirementDto>) {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.map((r, i) => (i === index ? { ...r, ...patch } : r))
    }));
  }

  function addRequirement() {
    setForm((f) => ({
      ...f,
      requirements: [
        ...f.requirements,
        { key: '', label: '', type: 'TEXT', required: false, displayOrder: f.requirements.length }
      ]
    }));
  }

  function removeRequirement(index: number) {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.filter((_, i) => i !== index).map((r, i) => ({ ...r, displayOrder: i }))
    }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    // No se permite un servicio con cobro por adelantado sin pagos en línea configurados y activos.
    if (form.requiresOnlinePayment && !paymentsReady) {
      toast.error(t('catalog:payment.needsConfig'));
      return;
    }
    const requirements = form.requirements
      .filter((r) => r.label.trim())
      .map((r, i) => ({
        key: (r.key.trim() || slugifyKey(r.label)) as string,
        label: r.label.trim(),
        type: r.type,
        required: r.required,
        displayOrder: i
      }));
    const body: OfferingRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category.trim() || undefined,
      durationMinutes: Number(form.durationMinutes),
      modality: form.modality,
      priceAmount: Number(form.priceAmount),
      priceCurrency: form.priceCurrency.trim().toUpperCase(),
      requiresOnlinePayment: form.requiresOnlinePayment,
      requirements
    };
    try {
      await save.run(body);
      toast.success(editing ? t('common:feedback.updated') : t('common:feedback.created'));
      onSaved();
      onClose();
    } catch {
      /* error mostrado abajo */
    }
  }

  return (
    <Modal
      open={open}
      title={editing ? t('catalog:form.editTitle') : t('catalog:form.createTitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="offering-form" disabled={save.submitting || blockedByPayments}>
            {save.submitting ? t('common:actions.saving') : t('common:actions.save')}
          </Button>
        </>
      }
    >
      <form id="offering-form" className="hc-form" onSubmit={submit}>
        <TextField
          label={t('catalog:fields.name')}
          hint={t('catalog:hints.name')}
          name="name"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <div className="hc-form-row">
          <DatalistField
            label={t('catalog:fields.category')}
            hint={t('catalog:hints.category')}
            name="category"
            maxLength={80}
            value={form.category}
            options={categories}
            onChange={(e) => set('category', e.target.value)}
          />
          <Select
            label={t('catalog:fields.modality')}
            hint={t('catalog:hints.modality')}
            value={form.modality}
            onChange={(e) => set('modality', e.target.value)}
            options={MODALITIES.map((m) => ({ value: m, label: t(`catalog:modality.${m}`) }))}
          />
        </div>
        <div className="hc-form-row">
          <TextField
            label={t('catalog:fields.duration')}
            hint={t('catalog:hints.duration')}
            name="durationMinutes"
            type="number"
            min={1}
            required
            value={form.durationMinutes}
            onChange={(e) => set('durationMinutes', Number(e.target.value))}
          />
          <TextField
            label={t('catalog:fields.price')}
            hint={t('catalog:hints.price')}
            name="priceAmount"
            type="number"
            min={0}
            step="0.01"
            required
            value={form.priceAmount}
            onChange={(e) => set('priceAmount', Number(e.target.value))}
          />
          <Select
            label={t('catalog:fields.currency')}
            hint={t('catalog:hints.currency')}
            value={form.priceCurrency}
            onChange={(e) => set('priceCurrency', e.target.value)}
            options={currencies}
          />
        </div>
        <Textarea
          label={t('catalog:fields.description')}
          hint={t('catalog:hints.description')}
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <Checkbox
          label={t('catalog:fields.requiresOnlinePayment')}
          checked={form.requiresOnlinePayment}
          onChange={(e) => set('requiresOnlinePayment', e.target.checked)}
        />
        {blockedByPayments ? (
          <p className="hc-field-message hc-field-error offering-payment-warn">
            {t('catalog:payment.needsConfig')}{' '}
            <Link to="/pagos" onClick={onClose}>{t('catalog:payment.configure')}</Link>
          </p>
        ) : null}

        <div className="requirements-editor">
          <div className="requirements-head">
            <span className="hc-field-label">{t('catalog:requirements.title')}</span>
            <Button variant="ghost" size="sm" icon={<Plus size={15} />} onClick={addRequirement}>
              {t('catalog:requirements.add')}
            </Button>
          </div>
          {form.requirements.length === 0 ? (
            <p className="hc-field-message">{t('catalog:requirements.empty')}</p>
          ) : (
            <ul className="requirements-list">
              {form.requirements.map((r, i) => (
                <li key={i} className="requirement-row">
                  <TextField
                    label={t('catalog:requirements.label')}
                    value={r.label}
                    onChange={(e) => setRequirement(i, { label: e.target.value })}
                  />
                  <Select
                    label={t('catalog:requirements.type')}
                    value={r.type}
                    onChange={(e) => setRequirement(i, { type: e.target.value })}
                    options={REQUIREMENT_TYPES.map((rt) => ({ value: rt, label: t(`catalog:requirements.types.${rt}`) }))}
                  />
                  <Checkbox
                    label={t('catalog:requirements.required')}
                    checked={r.required}
                    onChange={(e) => setRequirement(i, { required: e.target.checked })}
                  />
                  <button
                    className="hc-icon-button"
                    type="button"
                    onClick={() => removeRequirement(i)}
                    aria-label={t('common:actions.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {save.error ? <p className="login-error">{save.error.message}</p> : null}
      </form>
    </Modal>
  );
}
