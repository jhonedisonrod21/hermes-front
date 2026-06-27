import { useEffect, useState, type FormEvent } from 'react';
import { CreditCard, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Checkbox, Select, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { PaymentsList } from './PaymentsList';
import { ApiError } from '../../api/http';
import { paymentApi, reportsApi } from '../../api/services';
import type { PaymentProvider, TenantPaymentConfigRequest, TenantPaymentConfigResponse } from '../../api/types';
import { formatDate } from '../../lib/format';

// Solo se ofrecen los proveedores con gateway implementado en el backend.
// WOMPI/PAYU existen en el enum pero aún no tienen adaptador (el checkout daría 501),
// así que no se listan aquí para no ofrecer una opción que no funciona.
const PROVIDERS: PaymentProvider[] = ['FAKE_PSE'];

function toForm(c: TenantPaymentConfigResponse | null) {
  return {
    provider: (c?.provider ?? 'FAKE_PSE') as PaymentProvider,
    enabled: c?.enabled ?? false,
    merchantAccount: c?.merchantAccount ?? '',
    publicKey: c?.publicKey ?? '',
    privateKey: '',
    eventsSecret: ''
  };
}

export function PaymentConfigPage() {
  const { t, i18n } = useTranslation(['payments', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  // Si aún no hay configuración, el backend responde 404: lo tratamos como "nueva".
  const config = useResource<TenantPaymentConfigResponse | null>(
    () => paymentApi.getMyConfig().catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
    []
  );
  const [form, setForm] = useState(() => toForm(null));
  const save = useMutation((body: TenantPaymentConfigRequest) => paymentApi.saveMyConfig(body));

  useEffect(() => {
    if (config.data !== undefined) setForm(toForm(config.data));
  }, [config.data]);

  const set = <K extends keyof ReturnType<typeof toForm>>(k: K, v: ReturnType<typeof toForm>[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    // Activar cobros exige una configuración completa: comercio, llave pública y ambos secretos
    // (recién escritos o ya guardados). Evita habilitar pagos que luego fallan en el checkout.
    if (form.enabled) {
      const cfg = config.data;
      const hasPrivate = Boolean(form.privateKey.trim() || cfg?.privateKeyConfigured);
      const hasEvents = Boolean(form.eventsSecret.trim() || cfg?.eventsSecretConfigured);
      if (!form.merchantAccount.trim() || !form.publicKey.trim() || !hasPrivate || !hasEvents) {
        toast.error(t('payments:enableNeedsConfig'));
        return;
      }
    }
    const body: TenantPaymentConfigRequest = {
      provider: form.provider,
      enabled: form.enabled,
      merchantAccount: form.merchantAccount.trim() || undefined,
      publicKey: form.publicKey.trim() || undefined,
      // Las credenciales secretas solo se envían si se escribieron (no sobreescribir con vacío).
      privateKey: form.privateKey.trim() || undefined,
      eventsSecret: form.eventsSecret.trim() || undefined
    };
    try {
      await save.run(body);
      toast.success(t('payments:saved'));
      setForm((f) => ({ ...f, privateKey: '', eventsSecret: '' }));
      config.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  async function remove() {
    const ok = await confirm({
      title: t('payments:deleteConfirm.title'),
      message: t('payments:deleteConfirm.message'),
      confirmLabel: t('payments:delete'),
      danger: true
    });
    if (!ok) return;
    try {
      await paymentApi.deleteMyConfig();
      toast.success(t('payments:deleted'));
      config.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  const existing = config.data;

  return (
    <div className="page">
      <PageHeader eyebrow={t('payments:eyebrow')} title={t('payments:title')} description={t('payments:description')} />

      <Card className="panel form-panel">
        <DataState loading={config.loading} error={config.error} onRetry={config.reload}>
          <div className="org-summary">
            <span className="org-summary-mark"><CreditCard size={22} /></span>
            <div>
              <strong>{t(`payments:providers.${form.provider}`)}</strong>
              {existing?.updatedAt ? (
                <span className="org-slug">{t('payments:updatedAt', { date: formatDate(existing.updatedAt, i18n.language) })}</span>
              ) : (
                <span className="org-slug">{t('payments:notConfigured')}</span>
              )}
            </div>
            <Badge tone={form.enabled ? 'success' : 'warning'}>
              {form.enabled ? t('payments:active') : t('payments:inactive')}
            </Badge>
          </div>

          <form className="hc-form" onSubmit={submit}>
            <div className="hc-form-row">
              <Select
                label={t('payments:fields.provider')}
                hint={t('payments:hints.provider')}
                value={form.provider}
                onChange={(e) => set('provider', e.target.value as PaymentProvider)}
                options={PROVIDERS.map((p) => ({ value: p, label: t(`payments:providers.${p}`) }))}
              />
              <TextField
                label={t('payments:fields.merchantAccount')}
                hint={t('payments:hints.merchantAccount')}
                value={form.merchantAccount}
                onChange={(e) => set('merchantAccount', e.target.value)}
              />
            </div>
            <TextField
              label={t('payments:fields.publicKey')}
              hint={t('payments:hints.publicKey')}
              value={form.publicKey}
              onChange={(e) => set('publicKey', e.target.value)}
            />
            <div className="hc-form-row">
              <TextField
                label={t('payments:fields.privateKey')}
                type="password"
                autoComplete="off"
                placeholder={existing?.privateKeyConfigured ? t('payments:configured') : undefined}
                hint={t('payments:secretHint')}
                value={form.privateKey}
                onChange={(e) => set('privateKey', e.target.value)}
              />
              <TextField
                label={t('payments:fields.eventsSecret')}
                type="password"
                autoComplete="off"
                placeholder={existing?.eventsSecretConfigured ? t('payments:configured') : undefined}
                hint={t('payments:secretHint')}
                value={form.eventsSecret}
                onChange={(e) => set('eventsSecret', e.target.value)}
              />
            </div>
            <Checkbox
              label={t('payments:fields.enabled')}
              checked={form.enabled}
              onChange={(e) => set('enabled', e.target.checked)}
            />

            {save.error ? <p className="login-error">{save.error.message}</p> : null}

            <div className="panel-actions">
              {existing ? (
                <Button variant="ghost" icon={<Trash2 size={16} />} onClick={remove}>
                  {t('payments:delete')}
                </Button>
              ) : null}
              <Button type="submit" icon={<Save size={17} />} disabled={save.submitting}>
                {save.submitting ? t('common:actions.saving') : t('common:actions.save')}
              </Button>
            </div>
          </form>
        </DataState>
      </Card>

      <PaymentsList
        title={t('payments:received.title')}
        loader={() => paymentApi.listReceivedPayments({ size: 50, sort: 'createdAt,desc' })}
        receiptLoader={reportsApi.receiptBlob}
      />
    </div>
  );
}
