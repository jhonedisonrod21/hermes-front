import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { BrandLogo, Card } from '../components/ui';

export function LoginPage() {
  const { t } = useTranslation('auth');

  return (
    <main className="shell login-shell">
      <LanguageSwitcher />
      <section className="login-panel" aria-label={t('login.ariaLabel')}>
        <Card className="login-card">
          <div className="login-card-brand">
            <BrandLogo variant="appIcon" />
          </div>
          <div className="login-card-header">
            <div>              
              <h2>{t('login.title')}</h2>
            </div>
          </div>
          <LoginForm />
        </Card>
      </section>
    </main>
  );
}
