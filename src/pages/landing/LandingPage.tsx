import { PublicShell } from '../../components/PublicShell';
import { LandingContent } from './LandingContent';

/**
 * Landing anónima: top-bar con búsqueda (PublicShell) + contenido compartido + footer. El usuario
 * invitado autenticado ve el mismo contenido (LandingContent) en su inicio, dentro del AppShell.
 */
export function LandingPage() {
  return (
    <PublicShell>
      <LandingContent />
    </PublicShell>
  );
}
