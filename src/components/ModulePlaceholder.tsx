import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Card } from './ui';
import { PageHeader } from './PageHeader';
import { HermesDial } from './HermesDial';

type ModulePlaceholderProps = {
  title: string;
  description: string;
  /** Servicio backend pendiente (p. ej. "hermes-scheduling-service · citas"). */
  service: string;
  /** Lista de capacidades previstas (de la pizarra del dominio). */
  capabilities?: string[];
  children?: ReactNode;
};

/** Pantalla para módulos cuya navegación ya existe pero cuyo microservicio aún no está disponible. */
export function ModulePlaceholder({ title, description, service, capabilities, children }: Readonly<ModulePlaceholderProps>) {
  const { t } = useTranslation('common');

  return (
    <div className="page">
      <PageHeader title={title} description={description} />

      <Card className="panel placeholder-panel">
        <div className="placeholder-dial" aria-hidden="true">
          <HermesDial labels={false} />
        </div>
        <Badge tone="warning">{t('placeholder.pending')}</Badge>
        <h2>{t('placeholder.title')}</h2>
        
      </Card>
    </div>
  );
}
