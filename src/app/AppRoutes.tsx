import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../components/AppShell';
import { LandingPage } from '../pages/landing/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { OverviewPage } from '../pages/OverviewPage';
import { OfferingsPage } from '../pages/catalog/OfferingsPage';
import { SchedulePage } from '../pages/scheduling/SchedulePage';
import { MembersPage } from '../pages/team/MembersPage';
import { OrganizationPage } from '../pages/organization/OrganizationPage';
import { TenantsPage } from '../pages/admin/TenantsPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { ExplorePage } from '../pages/explore/ExplorePage';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { MyBookingsPage } from '../pages/bookings/MyBookingsPage';
import { AccountPage } from '../pages/account/AccountPage';
import { useAuth } from '../hermes-security/useAuth';
import { actorKind } from '../hermes-security/sessionStore';

export function AppRoutes() {
  const { authenticated, loading, session } = useAuth();
  const { t } = useTranslation('common');

  if (loading) {
    return (
      <main className="shell shell-centered">
        <div className="loading-panel hc-card">{t('loadingSession')}</div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/acceso" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const kind = actorKind(session?.profile);
  const isAdmin = kind === 'system-admin';
  const isTenantAdmin = kind === 'tenant-admin';
  const isPartner = kind === 'tenant-partner';
  const isGuest = kind === 'guest';

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        {/* Cuenta: disponible para todos los actores. */}
        <Route path="cuenta" element={<AccountPage />} />

        {isAdmin && <Route path="admin/tenants" element={<TenantsPage />} />}
        {isAdmin && <Route path="admin/usuarios" element={<UsersPage />} />}

        {isTenantAdmin && <Route path="catalogo" element={<OfferingsPage />} />}
        {isTenantAdmin && <Route path="agenda" element={<SchedulePage />} />}
        {isTenantAdmin && <Route path="reportes" element={<ReportsPage />} />}
        {isTenantAdmin && <Route path="equipo" element={<MembersPage />} />}
        {isTenantAdmin && <Route path="organizacion" element={<OrganizationPage />} />}

        {isPartner && <Route path="citas" element={<AppointmentsPage />} />}

        {isGuest && <Route path="explorar" element={<ExplorePage />} />}
        {isGuest && <Route path="mis-reservas" element={<MyBookingsPage />} />}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
