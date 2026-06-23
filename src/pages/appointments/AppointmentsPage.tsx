import { useTranslation } from 'react-i18next';
import { ModulePlaceholder } from '../../components/ModulePlaceholder';

export function AppointmentsPage() {
  const { t } = useTranslation('appointments');
  return (
    <ModulePlaceholder
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      service="hermes-scheduling-service · citas"
      capabilities={[
        t('capabilities.create'),
        t('capabilities.reschedule'),
        t('capabilities.cancel'),
        t('capabilities.markStates')
      ]}
    />
  );
}
