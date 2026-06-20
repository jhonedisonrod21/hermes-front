import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './hermes-security/useAuth';
import { useTranslation } from 'react-i18next';

export function App() {
  const { authenticated, loading } = useAuth();
  const { t } = useTranslation('common');

  if (loading) {
    return (
      <main className="shell shell-centered">
        <div className="loading-panel">{t('loadingSession')}</div>
      </main>
    );
  }

  return authenticated ? <DashboardPage /> : <LoginPage />;
}
