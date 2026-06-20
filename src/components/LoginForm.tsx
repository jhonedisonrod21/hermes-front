import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hermes-security/useAuth';
import { Button, IconButton, TextField } from './ui';

export function LoginForm() {
  const { login } = useAuth();
  const { t } = useTranslation('auth');
  const [username, setUsername] = useState('admin@hermes.local');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await login(username, password);
    } catch (exception) {
      console.error('Hermes login failed', exception);
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

      <Button fullWidth icon={<LogIn size={18} />} size="lg" type="submit">
        {t('login.submit')}
      </Button>
    </form>
  );
}
