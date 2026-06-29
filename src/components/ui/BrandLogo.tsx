import { useTranslation } from 'react-i18next';

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  variant?: 'full' | 'simple' | 'minimal' | 'appIcon';
};

const brandSources = {
  full: '/brand/hermes-logo-full-transparent.svg',
  simple: '/brand/hermes-logo-simple-transparent.svg',
  minimal: '/brand/hermes-logo-minimalista.svg',
  appIcon: '/brand/hermes-logo-app-icon.svg'
};

export function BrandLogo({ className = '', compact = false, variant = 'full' }: Readonly<BrandLogoProps>) {
  const { t } = useTranslation('common');
  const showWordmark = !compact && variant !== 'full';
  const ariaLabel = t('brand.ariaLabel');

  return (
    <div className={`hc-brand hc-brand-${variant} ${compact ? 'hc-brand-compact' : ''} ${className}`.trim()}>
      {showWordmark ? (
        <div className="hc-brand-wordmark" aria-label={ariaLabel}>
          <strong>{t('appName')}</strong>
        </div>
      ) : null}
      <img alt={showWordmark ? '' : ariaLabel} className="hc-brand-mark" src={brandSources[variant]} />
    </div>
  );
}
