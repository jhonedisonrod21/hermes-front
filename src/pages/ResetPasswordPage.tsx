import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { HermesDial } from '../components/HermesDial';
import { authService } from '../hermes-security/authService';
import { BrandLogo, Button, Card, IconButton, TextField } from '../components/ui';

const MIN_PASSWORD = 8;

/**
 * Página pública de restablecimiento de contraseña. Se abre desde el enlace del correo
 * (/reset-password?token=...). Toma el token de la URL y permite definir la nueva contraseña.
 */
export function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'common']);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = (params.get('token') ?? '').trim();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (form.newPassword.length < MIN_PASSWORD) {
      setError(t('register.errors.passwordTooShort', { min: MIN_PASSWORD }));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError(t('register.errors.passwordMismatch'));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authService.confirmPasswordReset(token, form.newPassword);
      setDone(true);
    } catch {
      setError(t('reset.errors.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell login-shell">
      <HermesDial className="login-shell-dial" labels={false} />
      <Link to="/" className="login-back">
        <ArrowLeft size={16} /> {t('common:appName')}
      </Link>
      <LanguageSwitcher />
      <section className="login-panel" aria-label={t('reset.title')}>
        <Card className="login-card">
          <div className="login-card-brand">
            <BrandLogo variant="appIcon" />
          </div>
          <div className="login-card-header">
            <div>
              <h2>{t('reset.title')}</h2>
            </div>
          </div>

          {done ? (
            <div className="login-form login-done">
              <span className="login-done-mark" aria-hidden="true">
                <CheckCircle2 size={34} />
              </span>
              <strong>{t('reset.doneTitle')}</strong>
              <p>{t('reset.doneBody')}</p>
              <Button fullWidth size="lg" onClick={() => navigate('/acceso')}>
                {t('reset.goToLogin')}
              </Button>
            </div>
          ) : !token ? (
            <div className="login-form">
              <p className="login-error" role="alert">
                {t('reset.invalidLink')}
              </p>
              <Link to="/acceso" className="hc-button hc-button-primary hc-button-lg">
                <span>{t('reset.goToLogin')}</span>
              </Link>
            </div>
          ) : (
            <form className="login-form" onSubmit={submit}>
              <p className="login-hint">{t('reset.intro')}</p>
              <TextField
                autoComplete="new-password"
                label={t('reset.newPassword')}
                hint={t('reset.newPasswordHint', { min: MIN_PASSWORD })}
                leadingIcon={<LockKeyhole size={18} />}
                name="newPassword"
                trailingControl={
                  <IconButton
                    icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                    onClick={() => setShowPassword((v) => !v)}
                  />
                }
                type={showPassword ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              />
              <TextField
                autoComplete="new-password"
                label={t('reset.confirm')}
                leadingIcon={<LockKeyhole size={18} />}
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              />
              {error ? (
                <p className="login-error" role="alert">
                  {error}
                </p>
              ) : null}
              <Button disabled={submitting} fullWidth icon={<KeyRound size={18} />} size="lg" type="submit">
                {submitting ? t('reset.submitting') : t('reset.submit')}
              </Button>
            </form>
          )}
        </Card>
      </section>
    </main>
  );
}
