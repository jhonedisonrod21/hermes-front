import { useEffect, useState } from 'react';
import { Building2, CalendarPlus, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { MapPicker } from '../../components/map/MapPicker';
import { Badge, Button } from '../../components/ui';
import { tenantApi } from '../../api/services';
import { ApiError } from '../../api/http';
import type { OfferingSearchResult, PublicOrganizationResponse } from '../../api/types';
import { formatDuration, formatMoney } from '../../lib/format';

type Props = {
  offering: OfferingSearchResult | null;
  onClose: () => void;
  /** Inicia la reserva del servicio (lo gestiona la página: sesión o redirección a acceso). */
  onBook: (o: OfferingSearchResult) => void;
};

/** Diálogo "Ver": todos los datos del producto + el establecimiento y su ubicación en el mapa. */
export function OfferingDetailModal({ offering, onClose, onBook }: Props) {
  const { t, i18n } = useTranslation(['explore', 'catalog', 'common']);
  const o = offering;
  const tenantId = o?.tenantId ?? null;
  const [org, setOrg] = useState<PublicOrganizationResponse | null>(null);

  useEffect(() => {
    setOrg(null);
    if (!tenantId) return undefined;
    let active = true;
    tenantApi
      .publicOrganization(tenantId)
      .then((data) => {
        if (active) setOrg(data);
      })
      .catch((e) => {
        // Si la organización no expone datos públicos, mostramos solo el nombre que ya trae la oferta.
        if (!(e instanceof ApiError)) throw e;
      });
    return () => {
      active = false;
    };
  }, [tenantId]);

  const lat = org?.location?.latitude;
  const lng = org?.location?.longitude;
  const hasLocation = lat != null && lng != null;
  const orgAddress = [org?.address, org?.city, org?.country].filter(Boolean).join(', ');

  return (
    <Modal
      open={o !== null}
      title={o?.name ?? ''}
      onClose={onClose}
      className="hc-modal-wide"
      footer={
        o ? (
          <Button
            variant="accent"
            icon={<CalendarPlus size={17} />}
            onClick={() => {
              onBook(o);
              onClose();
            }}
          >
            {t('explore:book')}
          </Button>
        ) : null
      }
    >
      {o ? (
        <div className="svc-detail">
          {/* 1. Mapa del establecimiento en la parte superior. */}
          {hasLocation ? (
            <div className="svc-detail-map">
              <MapPicker readOnly latitude={Number(lat)} longitude={Number(lng)} />
            </div>
          ) : null}

          {/* 2. Carta de presentación del establecimiento. */}
          <div className="org-summary">
            <span className="org-summary-mark"><Building2 size={22} /></span>
            <div>
              <strong>{org?.name ?? o.tenantName ?? '—'}</strong>
              {orgAddress ? (
                <span className="org-slug"><MapPin size={13} /> {orgAddress}</span>
              ) : null}
            </div>
          </div>
          {!hasLocation ? <p className="appt-detail-muted">{t('explore:noLocation')}</p> : null}

          {/* 3. Badges. */}
          <div className="svc-detail-badges">
            <Badge tone="info">{t(`catalog:modality.${o.modality}`, o.modality)}</Badge>
            {o.category ? <Badge tone="accent">{o.category}</Badge> : null}
            {o.requiresOnlinePayment ? <Badge tone="warning">{t('explore:onlinePayment')}</Badge> : null}
          </div>

          {/* 4. Resto de los datos del producto. */}
          <dl className="session-details appt-detail-grid">
            <div>
              <dt>{t('catalog:fields.duration')}</dt>
              <dd>{formatDuration(o.durationMinutes, t('common:units.hour'), t('common:units.minute'))}</dd>
            </div>
            {o.priceAmount != null && o.priceAmount > 0 ? (
              <div>
                <dt>{t('catalog:fields.price')}</dt>
                <dd>{formatMoney(o.priceAmount, o.priceCurrency, i18n.language)}</dd>
              </div>
            ) : null}
          </dl>

          {o.description ? <p className="svc-detail-desc">{o.description}</p> : null}

          {o.requirements?.length ? (
            <section className="svc-detail-section">
              <span className="hc-field-label">{t('explore:requirements')}</span>
              <ul className="svc-detail-reqs">
                {o.requirements.map((r) => (
                  <li key={r.key}>{r.label}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
