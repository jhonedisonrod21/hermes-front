import { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Button, DatalistField, Select, Textarea, TextField } from '../../components/ui';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { countryOptions } from '../../lib/countries';
import { citiesFor } from '../../lib/cities';
import { tenantApi } from '../../api/services';
import type { TenantCreateRequest, TenantResponse, TenantUpdateRequest } from '../../api/types';

type Props = {
  open: boolean;
  editing: TenantResponse | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormErrors = Partial<Record<'name' | 'taxId' | 'country' | 'city' | 'address' | 'description', string>>;

function toForm(t: TenantResponse | null) {
  return {
    name: t?.name ?? '',
    taxId: t?.taxId ?? '',
    country: (t?.country ?? '').toUpperCase(),
    city: t?.city ?? '',
    address: t?.address ?? '',
    description: t?.description ?? ''
  };
}

// Límites alineados con las restricciones de TenantCreateRequest/TenantUpdateRequest del backend.
const MAX = { name: 160, taxId: 40, city: 120, address: 200, description: 500 };

export function TenantFormModal({ open, editing, onClose, onSaved }: Props) {
  const { t, i18n } = useTranslation(['admin', 'organization', 'common']);
  const toast = useToast();
  const countries = useMemo(() => countryOptions(i18n.language), [i18n.language]);
  const [form, setForm] = useState(() => toForm(editing));
  const [errors, setErrors] = useState<FormErrors>({});
  const save = useMutation((body: TenantCreateRequest | TenantUpdateRequest) =>
    editing ? tenantApi.updateTenant(editing.id, body) : tenantApi.createTenant(body)
  );

  const [lastKey, setLastKey] = useState('');
  const key = `${open}-${editing?.id ?? 'new'}`;
  if (key !== lastKey) {
    setLastKey(key);
    setForm(toForm(editing));
    setErrors({});
    save.reset();
  }

  const set = (k: keyof ReturnType<typeof toForm>, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function validate(): FormErrors {
    const e: FormErrors = {};
    const req = t('common:validation.required');
    const maxMsg = (n: number) => t('common:validation.maxLength', { max: n });

    if (!form.name.trim()) e.name = req;
    else if (form.name.trim().length > MAX.name) e.name = maxMsg(MAX.name);

    if (!form.taxId.trim()) e.taxId = req;
    else if (form.taxId.trim().length > MAX.taxId) e.taxId = maxMsg(MAX.taxId);

    if (!form.country) e.country = t('common:validation.country');

    if (!form.city.trim()) e.city = req;
    else if (form.city.trim().length > MAX.city) e.city = maxMsg(MAX.city);

    if (form.address.trim().length > MAX.address) e.address = maxMsg(MAX.address);
    if (form.description.trim().length > MAX.description) e.description = maxMsg(MAX.description);
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error(t('common:validation.fix'));
      return;
    }
    const body = {
      name: form.name.trim(),
      taxId: form.taxId.trim(),
      country: form.country,
      city: form.city.trim(),
      address: form.address.trim() || undefined,
      description: form.description.trim() || undefined
    };
    try {
      await save.run(body);
      toast.success(editing ? t('common:feedback.updated') : t('common:feedback.created'));
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  return (
    <Modal
      open={open}
      title={editing ? t('admin:tenants.editTitle') : t('admin:tenants.createTitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="tenant-form" disabled={save.submitting}>
            {save.submitting
              ? t('common:actions.saving')
              : editing
                ? t('common:actions.save')
                : t('admin:tenants.create')}
          </Button>
        </>
      }
    >
      <form id="tenant-form" className="hc-form" onSubmit={submit} noValidate>
        <TextField
          label={t('organization:fields.name')}
          hint={t('organization:hints.name')}
          maxLength={MAX.name}
          value={form.name}
          error={errors.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <div className="hc-form-row">
          <TextField
            label={t('organization:fields.taxId')}
            hint={t('organization:hints.taxId')}
            maxLength={MAX.taxId}
            value={form.taxId}
            error={errors.taxId}
            onChange={(e) => set('taxId', e.target.value)}
          />
          <Select
            label={t('organization:fields.country')}
            hint={t('organization:hints.country')}
            value={form.country}
            error={errors.country}
            placeholder={t('organization:fields.countryPlaceholder')}
            options={countries}
            onChange={(e) => set('country', e.target.value)}
          />
          <DatalistField
            label={t('organization:fields.city')}
            hint={t('organization:hints.city')}
            maxLength={MAX.city}
            value={form.city}
            error={errors.city}
            options={citiesFor(form.country)}
            onChange={(e) => set('city', e.target.value)}
          />
        </div>
        <TextField
          label={t('organization:fields.address')}
          hint={t('organization:hints.address')}
          maxLength={MAX.address}
          value={form.address}
          error={errors.address}
          onChange={(e) => set('address', e.target.value)}
        />
        <Textarea
          label={t('organization:fields.description')}
          hint={t('organization:hints.description')}
          rows={3}
          maxLength={MAX.description}
          value={form.description}
          error={errors.description}
          onChange={(e) => set('description', e.target.value)}
        />
        {save.error ? <p className="login-error">{save.error.message}</p> : null}
      </form>
    </Modal>
  );
}
