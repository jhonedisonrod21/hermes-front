import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, User, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hermes-security/useAuth';
import { authService } from '../hermes-security/authService';
import { Button, IconButton, TextField } from './ui';

const MIN_PASSWORD = 8;

export function RegisterForm() {
  const { login } = useAuth();
  const { t } = useTranslation('auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    if (password.length < MIN_PASSWORD) {
      setError(t('register.errors.passwordTooShort', { min: MIN_PASSWORD }));
      return;
    }
    if (password !== confirm) {
      setError(t('register.errors.passwordMismatch'));
      return;
    }
    if (!name.trim()) {
      setError(t('register.errors.nameRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await authService.register(name.trim(), email.trim().toLowerCase(), password);
      // Registro correcto: iniciamos sesión enseguida (login() redirige al flujo OAuth del BFF).
      await login(email.trim().toLowerCase(), password);
    } catch (exception) {
      console.error('Hermes registration failed', exception);
      setError(exception instanceof Error && exception.message ? exception.message : t('register.errors.failed'));
      setSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <TextField
        autoComplete="name"
        label={t('register.name')}
        leadingIcon={<User size={18} />}
        name="name"
        onChange={(event) => setName(event.target.value)}
        placeholder={t('register.namePlaceholder')}
        required
        maxLength={120}
        value={name}
      />

      <TextField
        autoComplete="email"
        label={t('register.email')}
        leadingIcon={<Mail size={18} />}
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t('register.emailPlaceholder')}
        required
        type="email"
        value={email}
      />

      <TextField
        autoComplete="new-password"
        label={t('register.password')}
        hint={t('register.passwordHint', { min: MIN_PASSWORD })}
        leadingIcon={<LockKeyhole size={18} />}
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        required
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

      <TextField
        autoComplete="new-password"
        label={t('register.confirm')}
        leadingIcon={<LockKeyhole size={18} />}
        name="confirm"
        onChange={(event) => setConfirm(event.target.value)}
        required
        type={showPassword ? 'text' : 'password'}
        value={confirm}
      />

      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}

      <Button disabled={submitting} fullWidth icon={<UserPlus size={18} />} size="lg" type="submit">
        {submitting ? t('register.submitting') : t('register.submit')}
      </Button>
    </form>
  );
}
