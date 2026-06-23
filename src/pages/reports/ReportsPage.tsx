import { useTranslation } from 'react-i18next';
import { ModulePlaceholder } from '../../components/ModulePlaceholder';

export function ReportsPage() {
  const { t } = useTranslation('reports');
  return (
    <ModulePlaceholder
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      service="hermes-integration-hub-service · reportes"
      capabilities={[t('capabilities.appointments'), t('capabilities.revenue'), t('capabilities.occupancy')]}
    />
  );
}
