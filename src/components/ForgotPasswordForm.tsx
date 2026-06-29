import { useState, type FormEvent } from 'react';
import { Mail, MailCheck, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from './ui';
import { authService } from '../hermes-security/authService';

/**
 * Recuperación de contraseña para usuarios sin sesión, en la pantalla de acceso. Pide el correo y
 * dispara el envío de un enlace de restablecimiento (endpoint público). El usuario continúa desde
 * el enlace del correo, que abre la página /reset-password.
 */
export function ForgotPasswordForm({ onDone }: Readonly<{ onDone: () => void }>) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestLink(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim()) {
      setError(t('forgot.errors.emailRequired'));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t('forgot.errors.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="login-form login-done">
        <span className="login-done-mark" aria-hidden="true">
          <MailCheck size={34} />
        </span>
        <strong>{t('forgot.sentTitle')}</strong>
        <p>{t('forgot.sentBody')}</p>
        <Button fullWidth size="lg" onClick={onDone}>
          {t('forgot.backToLogin')}
        </Button>
        <button type="button" className="login-switch-link login-resend" onClick={() => setSent(false)}>
          {t('forgot.resend')}
        </button>
      </div>
    );
  }

  return (
    <form className="login-form" onSubmit={requestLink}>
      <p className="login-hint">{t('forgot.introRequest')}</p>
      <TextField
        autoComplete="email"
        label={t('forgot.email')}
        leadingIcon={<Mail size={18} />}
        name="email"
        type="email"
        placeholder={t('forgot.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button disabled={submitting} fullWidth icon={<Send size={18} />} size="lg" type="submit">
        {submitting ? t('forgot.requesting') : t('forgot.requestSubmit')}
      </Button>
    </form>
  );
}
