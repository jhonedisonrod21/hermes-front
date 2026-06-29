import { useTranslation } from 'react-i18next';
import { ModulePlaceholder } from '../../components/ModulePlaceholder';

/** Configuración de MercadoPago — pendiente de implementar (adaptador de pasarela). */
export function MercadoPagoConfigPage() {
  const { t } = useTranslation(['payments', 'app']);

  return (
    <ModulePlaceholder
      eyebrow={t('payments:eyebrow')}
      title={t('app:nav.paymentsMercadoPago')}
      description={t('payments:mercadopago.description')}
      service="hermes-payment-service · MercadoPago"
      capabilities={t('payments:mercadopago.capabilities', { returnObjects: true }) as string[]}
    />
  );
}
