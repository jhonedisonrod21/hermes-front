import { LandingCarousel } from './LandingCarousel';
import { LandingProducts } from './LandingProducts';
import { LandingCorporate } from './LandingCorporate';

/**
 * Contenido de la cara pública (carrusel, productos, sección para pequeñas empresas). Lo comparten la
 * landing anónima (dentro de PublicShell) y el inicio del usuario invitado (dentro del AppShell), para
 * que ambos vean exactamente la misma página. La exploración se dispara desde la barra de búsqueda.
 */
export function LandingContent() {
  return (
    <div className="public-panel">
      <div className="lp-fold">
        <LandingCarousel />
        <LandingProducts />
      </div>
      <LandingCorporate />
    </div>
  );
}
