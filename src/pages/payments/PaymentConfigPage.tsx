import { useEffect, useState, type FormEvent } from 'react';
import { CreditCard, Power, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Button, Card, Checkbox, Select, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { ApiError } from '../../api/http';
import { paymentApi } from '../../api/services';
import type { PaymentProvider, TenantPaymentConfigRequest, TenantPaymentConfigResponse } from '../../api/types';
import { formatDate } from '../../lib/format';

// Solo se ofrecen los proveedores con gateway implementado en el backend.
// WOMPI/PAYU existen en el enum pero aún no tienen adaptador (el checkout daría 501),
// así que no se listan aquí para no ofrecer una opción que no funciona.
const PROVIDERS: PaymentProvider[] = ['FAKE_PSE'];

const MASK = '#';
/** Enmascara por completo (longitud acotada para no generar cadenas enormes). */
const maskFull = (v?: string | null) => (v ? MASK.repeat(Math.min(Math.max(v.length, 8), 20)) : '');
/** Enmascara dejando visibles los últimos 4 caracteres (p. ej. la cuenta de comercio). */
const maskLast4 = (v?: string | null) => {
  if (!v) return '';
  if (v.length <= 4) return v;
  return MASK.repeat(Math.min(v.length - 4, 16)) + v.slice(-4);
};
const SECRET_MASK = MASK.repeat(12);

/** La cuenta de comercio solo admite dígitos. */
const onlyDigits = (v: string) => v.replace(/\D/g, '');
/**
 * Caracteres válidos de las llaves/secretos de una pasarela PSE (Wompi/PayU). Sus credenciales usan
 * el formato `pub_test_…`, `prv_prod_…`, `prod_events_…`: alfanuméricos con guion bajo (y guion).
 */
const keyChars = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, '');

function toForm(c: TenantPaymentConfigResponse | null) {
  return {
    provider: (c?.provider ?? 'FAKE_PSE') as PaymentProvider,
    enabled: c?.enabled ?? false,
    // Los valores reales no se cargan en los inputs: se muestran enmascarados como placeholder.
    merchantAccount: '',
    publicKey: '',
    privateKey: '',
    eventsSecret: ''
  };
}

export function PaymentConfigPage() {
  const { t, i18n } = useTranslation(['payments', 'common']);
  const toast = useToast();
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
    const cfg = config.data;

    // Desactivar los pagos y guardar limpia la configuración por completo (sustituye al botón
    // "Eliminar configuración"): el formulario queda vacío y deshabilitado.
    if (!form.enabled) {
      try {
        if (cfg) await paymentApi.deleteMyConfig();
        toast.success(t('payments:deleted'));
        setForm(toForm(null));
        config.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
      }
      return;
    }

    // Activar cobros exige una configuración completa: comercio, llave pública y ambos secretos
    // (recién escritos o ya guardados). Evita habilitar pagos que luego fallan en el checkout.
    const hasMerchant = Boolean(form.merchantAccount.trim() || cfg?.merchantAccount);
    const hasPublic = Boolean(form.publicKey.trim() || cfg?.publicKey);
    const hasPrivate = Boolean(form.privateKey.trim() || cfg?.privateKeyConfigured);
    const hasEvents = Boolean(form.eventsSecret.trim() || cfg?.eventsSecretConfigured);
    if (!hasMerchant || !hasPublic || !hasPrivate || !hasEvents) {
      toast.error(t('payments:enableNeedsConfig'));
      return;
    }

    const body: TenantPaymentConfigRequest = {
      provider: form.provider,
      enabled: true,
      // Si el campo se deja vacío (enmascarado), se conserva el valor ya guardado.
      merchantAccount: form.merchantAccount.trim() || cfg?.merchantAccount || undefined,
      publicKey: form.publicKey.trim() || cfg?.publicKey || undefined,
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

  const existing = config.data;

  return (
    <div className="page">
      <PageHeader
        eyebrow={t('payments:eyebrow')}
        title={t('payments:configTitle')}
        description={t('payments:configDescription')}
        actions={
          <Button type="submit" form="pse-form" icon={<Save size={17} />} disabled={save.submitting}>
            {save.submitting ? t('common:actions.saving') : t('common:actions.save')}
          </Button>
        }
      />

      <Card className="panel">
        <DataState loading={config.loading} error={config.error} onRetry={config.reload}>
          <div className="org-summary pse-card">
            <span className="org-summary-mark"><CreditCard size={22} /></span>
            <div className="pse-card-body">
              <div className="pse-title">
                <strong>{t(`payments:providers.${form.provider}`)}</strong>
                <span
                  className={`org-dot ${form.enabled ? 'is-on' : 'is-off'}`}
                  role="img"
                  aria-label={form.enabled ? t('payments:active') : t('payments:inactive')}
                  title={form.enabled ? t('payments:active') : t('payments:inactive')}
                >
                  <Power size={14} />
                </span>
              </div>
              {existing?.updatedAt ? (
                <span className="org-slug">{t('payments:updatedAt', { date: formatDate(existing.updatedAt, i18n.language) })}</span>
              ) : (
                <span className="org-slug">{t('payments:notConfigured')}</span>
              )}
              <Checkbox
                label={t('payments:fields.enabled')}
                checked={form.enabled}
                onChange={(e) => set('enabled', e.target.checked)}
              />
            </div>
          </div>

          <form id="pse-form" className="hc-form" onSubmit={submit}>
            <div className="hc-form-row">
              <Select
                label={t('payments:fields.provider')}
                hint={t('payments:hints.provider')}
                disabled={!form.enabled}
                value={form.provider}
                onChange={(e) => set('provider', e.target.value as PaymentProvider)}
                options={PROVIDERS.map((p) => ({ value: p, label: t(`payments:providers.${p}`) }))}
              />
              <TextField
                label={t('payments:fields.merchantAccount')}
                hint={t('payments:hints.merchantAccount')}
                disabled={!form.enabled}
                inputMode="numeric"
                placeholder={existing?.merchantAccount ? maskLast4(existing.merchantAccount) : undefined}
                value={form.merchantAccount}
                onChange={(e) => set('merchantAccount', onlyDigits(e.target.value))}
              />
            </div>
            <TextField
              label={t('payments:fields.publicKey')}
              hint={t('payments:hints.publicKey')}
              disabled={!form.enabled}
              placeholder={existing?.publicKey ? maskFull(existing.publicKey) : undefined}
              value={form.publicKey}
              onChange={(e) => set('publicKey', keyChars(e.target.value))}
            />
            <div className="hc-form-row">
              <TextField
                label={t('payments:fields.privateKey')}
                autoComplete="off"
                disabled={!form.enabled}
                placeholder={existing?.privateKeyConfigured ? SECRET_MASK : undefined}
                hint={t('payments:secretHint')}
                value={form.privateKey}
                onChange={(e) => set('privateKey', keyChars(e.target.value))}
              />
              <TextField
                label={t('payments:fields.eventsSecret')}
                autoComplete="off"
                disabled={!form.enabled}
                placeholder={existing?.eventsSecretConfigured ? SECRET_MASK : undefined}
                hint={t('payments:secretHint')}
                value={form.eventsSecret}
                onChange={(e) => set('eventsSecret', keyChars(e.target.value))}
              />
            </div>

            {save.error ? <p className="login-error">{save.error.message}</p> : null}
          </form>
        </DataState>
      </Card>
    </div>
  );
}
