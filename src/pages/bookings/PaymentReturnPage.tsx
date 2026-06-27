import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui';

/**
 * Aterrizaje tras volver de la pasarela PSE. El estado definitivo del pago lo confirma el
 * backend por webhook; aquí reflejamos el estado que devuelve el proveedor en la URL
 * (pagado / fallido / en confirmación) y enlazamos a "Mis reservas".
 */
export function PaymentReturnPage() {
  const { t } = useTranslation(['bookings', 'common']);
  const [params] = useSearchParams();
  const raw = (params.get('status') ?? params.get('state') ?? '').toUpperCase();
  const failed = raw.includes('FAIL') || raw.includes('DECLIN') || raw.includes('ERROR') || raw.includes('REJECT');
  const paid = !failed && (raw.includes('PAID') || raw.includes('APPROV') || raw.includes('SUCCESS') || raw.includes('OK'));
  const tone = failed ? 'is-error' : paid ? 'is-ok' : 'is-pending';
  const titleKey = failed ? 'failedTitle' : paid ? 'paidTitle' : 'title';
  const messageKey = failed ? 'failedMessage' : paid ? 'paidMessage' : 'message';

  return (
    <div className="page">
      <Card className="panel payment-return">
        <span className={`payment-return-mark ${tone}`} aria-hidden="true">
          {failed ? <XCircle size={34} /> : paid ? <CheckCircle2 size={34} /> : <Clock size={34} />}
        </span>
        <h1>{t(`bookings:return.${titleKey}`)}</h1>
        <p>{t(`bookings:return.${messageKey}`)}</p>
        <Link to="/mis-reservas" className="hc-button hc-button-primary hc-button-md">
          <span>{t('bookings:return.action')}</span>
        </Link>
      </Card>
    </div>
  );
}
