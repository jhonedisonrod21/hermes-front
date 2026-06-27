import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { HermesDial } from '../components/HermesDial';
import { BrandLogo, Card } from '../components/ui';

type Mode = 'login' | 'register' | 'forgot';

const TITLE_KEY: Record<Mode, string> = {
  login: 'login.title',
  register: 'register.title',
  forgot: 'forgot.title'
};

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common']);
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get('registro') === '1' ? 'register' : 'login');
  const isLogin = mode === 'login';

  return (
    <main className="shell login-shell">
      <HermesDial className="login-shell-dial" labels={false} />
      <Link to="/" className="login-back">
        <ArrowLeft size={16} /> {t('common:appName')}
      </Link>
      <LanguageSwitcher />
      <section className="login-panel" aria-label={t('login.ariaLabel')}>
        <Card className="login-card">
          <div className="login-card-brand">
            <BrandLogo variant="appIcon" />
          </div>
          <div className="login-card-header">
            <div>
              <h2>{t(TITLE_KEY[mode])}</h2>
            </div>
          </div>

          {mode === 'login' ? (
            <LoginForm onForgot={() => setMode('forgot')} />
          ) : mode === 'register' ? (
            <RegisterForm />
          ) : (
            <ForgotPasswordForm onDone={() => setMode('login')} />
          )}

          {mode === 'forgot' ? (
            <p className="login-switch">
              <button type="button" className="login-switch-link" onClick={() => setMode('login')}>
                {t('forgot.backToLogin')}
              </button>
            </p>
          ) : (
            <p className="login-switch">
              {isLogin ? t('register.prompt') : t('register.haveAccount')}{' '}
              <button type="button" className="login-switch-link" onClick={() => setMode(isLogin ? 'register' : 'login')}>
                {isLogin ? t('register.switchToRegister') : t('register.switchToLogin')}
              </button>
            </p>
          )}
        </Card>
      </section>
    </main>
  );
}
