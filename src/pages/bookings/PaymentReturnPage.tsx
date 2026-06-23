import { Clock, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui';

/**
 * Aterrizaje tras volver de la pasarela PSE. El estado real del pago lo confirma el backend
 * por webhook, así que aquí solo damos contexto y enlazamos a "Mis reservas".
 */
export function PaymentReturnPage() {
  const { t } = useTranslation(['bookings', 'common']);
  const [params] = useSearchParams();
  // Algunos proveedores devuelven un estado en la URL; si no, asumimos "en confirmación".
  const raw = (params.get('status') ?? params.get('state') ?? '').toUpperCase();
  const failed = raw.includes('FAIL') || raw.includes('DECLIN') || raw.includes('ERROR');

  return (
    <div className="page">
      <Card className="panel payment-return">
        <span className={`payment-return-mark ${failed ? 'is-error' : 'is-pending'}`} aria-hidden="true">
          {failed ? <XCircle size={34} /> : <Clock size={34} />}
        </span>
        <h1>{failed ? t('bookings:return.failedTitle') : t('bookings:return.title')}</h1>
        <p>{failed ? t('bookings:return.failedMessage') : t('bookings:return.message')}</p>
        <Link to="/mis-reservas" className="hc-button hc-button-primary hc-button-md">
          <span>{t('bookings:return.action')}</span>
        </Link>
      </Card>
    </div>
  );
}
