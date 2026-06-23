import { useTranslation } from 'react-i18next';
import { ModulePlaceholder } from '../../components/ModulePlaceholder';

export function MyBookingsPage() {
  const { t } = useTranslation('bookings');
  return (
    <ModulePlaceholder
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      service="hermes-scheduling-service · reservas · hermes-payment-service · pagos"
      capabilities={[t('capabilities.book'), t('capabilities.pay'), t('capabilities.history')]}
    />
  );
}
