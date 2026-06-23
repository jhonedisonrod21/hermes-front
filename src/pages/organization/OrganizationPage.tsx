import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Textarea, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { tenantApi } from '../../api/services';
import type { TenantContactUpdateRequest, TenantResponse } from '../../api/types';

type FormErrors = Partial<Record<'taxId' | 'address' | 'description', string>>;
const MAX = { taxId: 40, address: 200, description: 500 };

function toForm(t: TenantResponse | null) {
  return {
    taxId: t?.taxId ?? '',
    address: t?.address ?? '',
    description: t?.description ?? ''
  };
}

export function OrganizationPage() {
  const { t } = useTranslation(['organization', 'common']);
  const toast = useToast();
  const tenant = useResource(() => tenantApi.getMine(), []);
  const [form, setForm] = useState(() => toForm(null));
  const [errors, setErrors] = useState<FormErrors>({});
  const update = useMutation((body: TenantContactUpdateRequest) => tenantApi.updateMine(body));

  useEffect(() => {
    if (tenant.data) setForm(toForm(tenant.data));
  }, [tenant.data]);

  const set = (k: keyof ReturnType<typeof toForm>, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function validate(): FormErrors {
    const e: FormErrors = {};
    const maxMsg = (n: number) => t('common:validation.maxLength', { max: n });
    if (!form.taxId.trim()) e.taxId = t('common:validation.required');
    else if (form.taxId.trim().length > MAX.taxId) e.taxId = maxMsg(MAX.taxId);
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
    const body: TenantContactUpdateRequest = {
      taxId: form.taxId.trim(),
      address: form.address.trim() || undefined,
      description: form.description.trim() || undefined
    };
    try {
      await update.run(body);
      toast.success(t('common:feedback.updated'));
      tenant.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  const data = tenant.data;
  const location = [data?.city, data?.country].filter(Boolean).join(', ');

  return (
    <div className="page">
      <PageHeader eyebrow={t('organization:eyebrow')} title={t('organization:title')} description={t('organization:description')} />

      <Card className="panel form-panel">
        <DataState loading={tenant.loading} error={tenant.error} onRetry={tenant.reload}>
          <div className="org-summary">
            <span className="org-summary-mark"><Building2 size={22} /></span>
            <div>
              <strong>{data?.name}</strong>
              <span className="org-slug">{data?.slug}{location ? ` · ${location}` : ''}</span>
            </div>
            <Badge tone={data?.status === 'ACTIVE' ? 'success' : 'warning'}>
              {data?.status ? t(`common:statusValues.${data.status}`, data.status) : ''}
            </Badge>
          </div>

          <p className="account-hint">{t('organization:readonlyNote')}</p>

          <form className="hc-form" onSubmit={submit} noValidate>
            <TextField
              label={t('organization:fields.taxId')}
              hint={t('organization:hints.taxId')}
              maxLength={MAX.taxId}
              required
              value={form.taxId}
              error={errors.taxId}
              onChange={(e) => set('taxId', e.target.value)}
            />
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
            {update.error ? <p className="login-error">{update.error.message}</p> : null}
            <div className="panel-actions">
              <Button type="submit" icon={<Save size={17} />} disabled={update.submitting}>
                {update.submitting ? t('common:actions.saving') : t('common:actions.save')}
              </Button>
            </div>
          </form>
        </DataState>
      </Card>
    </div>
  );
}
