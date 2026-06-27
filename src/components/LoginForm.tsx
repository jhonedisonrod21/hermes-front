import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hermes-security/useAuth';
import { Button, IconButton, TextField } from './ui';

// Credenciales de conveniencia solo en desarrollo; nunca se precargan en un build de producción.
const INITIAL_USERNAME = import.meta.env.DEV ? 'admin@hermes.local' : '';
const INITIAL_PASSWORD = import.meta.env.DEV ? 'admin123' : '';

export function LoginForm({ onForgot }: { onForgot?: () => void }) {
  const { login } = useAuth();
  const { t } = useTranslation('auth');
  const [username, setUsername] = useState(INITIAL_USERNAME);
  const [password, setPassword] = useState(INITIAL_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // En éxito, login() redirige (full-page) al flujo OAuth del BFF: no reseteamos `submitting`.
      await login(username, password);
    } catch (exception) {
      console.error('Hermes login failed', exception);
      setError(
        exception instanceof Error && exception.message
          ? exception.message
          : t('errors.sessionLoginFailed')
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <TextField
        autoComplete="username"
        label={t('login.username')}
        leadingIcon={<Mail size={18} />}
        name="username"
        onChange={(event) => setUsername(event.target.value)}
        placeholder={t('login.usernamePlaceholder')}
        type="email"
        value={username}
      />

      <TextField
        autoComplete="current-password"
        label={t('login.password')}
        leadingIcon={<LockKeyhole size={18} />}
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder={t('login.passwordPlaceholder')}
        trailingControl={
          <IconButton
            icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
            onClick={() => setShowPassword((visible) => !visible)}
          />
        }
        type={showPassword ? 'text' : 'password'}
        value={password}
      />

      {onForgot ? (
        <div className="login-forgot">
          <button type="button" className="login-switch-link" onClick={onForgot}>
            {t('login.forgot')}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}

      <Button disabled={submitting} fullWidth icon={<LogIn size={18} />} size="lg" type="submit">
        {submitting ? t('login.submitting') : t('login.submit')}
      </Button>
    </form>
  );
}
