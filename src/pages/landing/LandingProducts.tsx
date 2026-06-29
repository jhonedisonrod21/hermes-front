import { Dumbbell, HeartPulse, Scale, Scissors } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Tarjetas de ejemplo de productos (maquetación): fondo azul + mosaico de calendarios. */
const PRODUCTS = [
  { key: 'haircut', Icon: Scissors },
  { key: 'medical', Icon: HeartPulse },
  { key: 'yoga', Icon: Dumbbell },
  { key: 'legal', Icon: Scale }
];

export function LandingProducts() {
  const { t } = useTranslation('landing');

  return (
    <section className="lp-products">
      <div className="lp-products-head">
        <h2>{t('products.title')}</h2>
        <p>{t('products.subtitle')}</p>
      </div>
      <div className="lp-product-row">
        {PRODUCTS.map(({ key, Icon }) => (
          <article className="lp-product-card" key={key}>
            <span className="lp-product-icon" aria-hidden="true">
              <Icon size={24} />
            </span>
            <h3>{t(`products.items.${key}.name`)}</h3>
            <p className="lp-product-cat">{t(`products.items.${key}.category`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
