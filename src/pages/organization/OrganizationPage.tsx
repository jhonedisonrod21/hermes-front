import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Banknote, Building2, Clock, MapPin, Pencil, Power, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Button, Card, DatalistField, Select, Textarea, TextField } from '../../components/ui';
import { MapPicker, type MapPickerHandle } from '../../components/map/MapPicker';
import { citiesFor } from '../../lib/cities';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { tenantApi, paymentApi, schedulingApi } from '../../api/services';
import { ApiError } from '../../api/http';
import type { TenantContactUpdateRequest, TenantPaymentConfigResponse, TenantResponse } from '../../api/types';

type FormErrors = Partial<Record<'taxId' | 'address' | 'description' | 'latitude' | 'longitude', string>>;
const MAX = { taxId: 40, city: 120, address: 200, description: 500, timeZone: 60 };

/** Zonas horarias IANA (todas las del navegador si están disponibles; si no, un conjunto común). */
const TIME_ZONES: string[] = (() => {
  const supported = (Intl as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
  if (typeof supported === 'function') {
    try {
      return supported('timeZone');
    } catch {
      /* noop: usamos el fallback */
    }
  }
  return ['America/Bogota', 'America/Mexico_City', 'America/Lima', 'America/Santiago', 'America/Argentina/Buenos_Aires', 'Europe/Madrid', 'UTC'];
})();

function toForm(t: TenantResponse | null) {
  return {
    taxId: t?.taxId ?? '',
    city: t?.city ?? '',
    address: t?.address ?? '',
    description: t?.description ?? '',
    timeZone: t?.timeZone ?? '',
    latitude: t?.location?.latitude != null ? String(t.location.latitude) : '',
    longitude: t?.location?.longitude != null ? String(t.location.longitude) : ''
  };
}

export function OrganizationPage() {
  const { t } = useTranslation(['organization', 'common']);
  const toast = useToast();
  const tenant = useResource(() => tenantApi.getMine(), []);
  // Config de pagos (solo para el indicador). Si aún no existe, el backend responde 404 → null.
  const payment = useResource<TenantPaymentConfigResponse | null>(
    () => paymentApi.getMyConfig().catch((e) => (e instanceof ApiError && e.status === 404 ? null : Promise.reject(e))),
    []
  );
  // Horario de atención (solo para el indicador): vacío = sin definir.
  const hours = useResource(() => schedulingApi.getHours().catch(() => []), []);
  const mapRef = useRef<MapPickerHandle>(null);
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

    // Coordenadas: o ambas vacías, o ambas válidas dentro de rango.
    const lat = form.latitude.trim();
    const lng = form.longitude.trim();
    if (lat || lng) {
      const latN = Number(lat);
      const lngN = Number(lng);
      if (!lat || Number.isNaN(latN) || latN < -90 || latN > 90) e.latitude = t('organization:validation.latitude');
      if (!lng || Number.isNaN(lngN) || lngN < -180 || lngN > 180) e.longitude = t('organization:validation.longitude');
    }
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
    const lat = form.latitude.trim();
    const lng = form.longitude.trim();
    const body: TenantContactUpdateRequest = {
      taxId: form.taxId.trim(),
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      description: form.description.trim() || undefined,
      timeZone: form.timeZone.trim() || undefined,
      location: lat && lng ? { latitude: Number(lat), longitude: Number(lng) } : undefined
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
  const place = useMemo(() => [data?.city, data?.country].filter(Boolean).join(', '), [data?.city, data?.country]);
  // Indicadores de la tarjeta de presentación.
  const isActive = data?.status === 'ACTIVE';
  const hasCoords = data?.location?.latitude != null && data?.location?.longitude != null;
  const paymentsOn = Boolean(payment.data?.enabled);
  const hoursDefined = (hours.data?.length ?? 0) > 0;
  const latNum = form.latitude.trim() !== '' && Number.isFinite(Number(form.latitude)) ? Number(form.latitude) : undefined;
  const lngNum = form.longitude.trim() !== '' && Number.isFinite(Number(form.longitude)) ? Number(form.longitude) : undefined;
  // Centro base del mapa cuando aún no hay coordenadas: la ciudad (y país) guardados del establecimiento.
  const mapBaseQuery = data ? [data.city, data.country].filter(Boolean).join(', ') : undefined;
  // Opciones de ciudad según el país del establecimiento. Se incluye el valor actual si no estuviera
  // en la lista (p. ej. ciudad antigua escrita a mano), para no perderlo.
  const cityOptions = useMemo(() => {
    const list = citiesFor(data?.country ?? '');
    const all = form.city && !list.includes(form.city) ? [form.city, ...list] : list;
    return all.map((c) => ({ value: c, label: c }));
  }, [data?.country, form.city]);

  return (
    <div className="page">
      <PageHeader
        title={t('organization:title')}
        description={t('organization:description')}
        actions={
          <Button type="submit" form="org-form" icon={<Save size={17} />} disabled={update.submitting}>
            {update.submitting ? t('common:actions.saving') : t('common:actions.save')}
          </Button>
        }
      />

      <Card className="panel">
        <DataState loading={tenant.loading} error={tenant.error} onRetry={tenant.reload}>
          <div className="org-summary">
            <span className="org-summary-mark"><Building2 size={24} /></span>
            <div>
              <div className="org-summary-name">
                <strong>{data?.name}</strong>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="org-summary-edit"
                  icon={<Pencil size={16} />}
                  aria-label={t('organization:editRestricted')}
                  title={t('organization:editRestricted')}
                  onClick={() => toast.info(t('organization:readonlyNote'))}
                />
              </div>
              <div className="org-summary-meta">
                {place ? <span className="org-slug">{place}</span> : null}
                <span className="org-indicators">
                  {([
                    { on: isActive, icon: <Power size={14} />, hint: isActive ? 'activeHint' : 'inactiveHint' },
                    { on: hoursDefined, icon: <Clock size={14} />, hint: hoursDefined ? 'hoursHint' : 'noHoursHint' },
                    { on: hasCoords, icon: <MapPin size={14} />, hint: hasCoords ? 'locationHint' : 'noLocationHint' },
                    { on: paymentsOn, icon: <Banknote size={14} />, hint: paymentsOn ? 'paymentsHint' : 'noPaymentsHint' }
                  ] as const).map((ind, i) => {
                    const label = t(`organization:indicators.${ind.hint}`);
                    return (
                      <span key={i} className={`org-dot ${ind.on ? 'is-on' : 'is-off'}`} role="img" aria-label={label} title={label}>
                        {ind.icon}
                      </span>
                    );
                  })}
                </span>
              </div>
            </div>
          </div>

          <form id="org-form" className="hc-form" onSubmit={submit} noValidate>
            <div className="hc-form-row">
              <TextField
                label={t('organization:fields.taxId')}
                hint={t('organization:hints.taxId')}
                maxLength={MAX.taxId}
                required
                value={form.taxId}
                error={errors.taxId}
                onChange={(e) => set('taxId', e.target.value)}
              />
              <Select
                label={t('organization:fields.city')}
                hint={t('organization:hints.city')}
                placeholder={t('organization:fields.cityPlaceholder')}
                value={form.city}
                options={cityOptions}
                onChange={(e) => {
                  set('city', e.target.value);
                  // Al elegir ciudad, el mapa se mueve a esa ciudad (geocodificada) y fija la ubicación.
                  if (e.target.value) mapRef.current?.goTo(e.target.value);
                }}
              />
              <DatalistField
                label={t('organization:fields.timeZone')}
                hint={t('organization:hints.timeZone')}
                options={TIME_ZONES}
                maxLength={MAX.timeZone}
                placeholder="America/Bogota"
                value={form.timeZone}
                onChange={(e) => set('timeZone', e.target.value)}
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

            <div className="hc-field">
              <span className="hc-field-label">{t('organization:fields.location')}</span>
              <MapPicker
                ref={mapRef}
                latitude={latNum}
                longitude={lngNum}
                baseQuery={mapBaseQuery}
                onChange={(lat, lng) => {
                  set('latitude', lat.toFixed(6));
                  set('longitude', lng.toFixed(6));
                }}
              />
              {errors.latitude || errors.longitude ? (
                <p className="hc-field-error">{errors.latitude ?? errors.longitude}</p>
              ) : null}
            </div>

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
          </form>
        </DataState>
      </Card>
    </div>
  );
}
