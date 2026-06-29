import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShell } from '../components/AppShell';
import { LandingPage } from '../pages/landing/LandingPage';
import { LandingContent } from '../pages/landing/LandingContent';
import { LoginPage } from '../pages/LoginPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { OverviewPage } from '../pages/OverviewPage';
import { OfferingsPage } from '../pages/catalog/OfferingsPage';
import { HorarioPage } from '../pages/scheduling/HorarioPage';
import { ExcepcionesPage } from '../pages/scheduling/ExcepcionesPage';
import { MembersPage } from '../pages/team/MembersPage';
import { OrganizationPage } from '../pages/organization/OrganizationPage';
import { TenantsPage } from '../pages/admin/TenantsPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { ExplorePage } from '../pages/explore/ExplorePage';
import { PublicShell } from '../components/PublicShell';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { PaymentConfigPage } from '../pages/payments/PaymentConfigPage';
import { PaymentsHistoryPage } from '../pages/payments/PaymentsHistoryPage';
import { MercadoPagoConfigPage } from '../pages/payments/MercadoPagoConfigPage';
import { MyBookingsPage } from '../pages/bookings/MyBookingsPage';
import { PaymentReturnPage } from '../pages/bookings/PaymentReturnPage';
import { AccountPage } from '../pages/account/AccountPage';
import { ChangePasswordPage } from '../pages/account/ChangePasswordPage';
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
        <Route
          path="/explorar"
          element={
            <PublicShell>
              <main className="app-content">
                <ExplorePage />
              </main>
            </PublicShell>
          }
        />
        <Route path="/acceso" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
        {/* El invitado comparte la cara pública: su inicio es la misma landing que ve el anónimo. */}
        <Route index element={isGuest ? <LandingContent /> : <OverviewPage />} />
        {/* Cuenta y retorno de pago: disponibles para todos los actores autenticados. */}
        <Route path="cuenta" element={<AccountPage />} />
        <Route path="cuenta/contrasena" element={<ChangePasswordPage />} />
        <Route path="payment/return" element={<PaymentReturnPage />} />
        {/* Exploración de servicios: la búsqueda del top-bar redirige aquí (cualquier autenticado). */}
        <Route path="explorar" element={<ExplorePage />} />

        {isAdmin && <Route path="admin/tenants" element={<TenantsPage />} />}
        {isAdmin && <Route path="admin/usuarios" element={<UsersPage />} />}

        {isTenantAdmin && <Route path="catalogo" element={<OfferingsPage />} />}
        {isTenantAdmin && <Route path="reportes" element={<ReportsPage />} />}
        {isTenantAdmin && <Route path="pagos" element={<Navigate to="/pagos/wompi" replace />} />}
        {isTenantAdmin && <Route path="pagos/wompi" element={<PaymentConfigPage />} />}
        {isTenantAdmin && <Route path="pagos/mercadopago" element={<MercadoPagoConfigPage />} />}
        {isTenantAdmin && <Route path="pagos/historial" element={<PaymentsHistoryPage />} />}
        {isTenantAdmin && <Route path="equipo" element={<MembersPage />} />}
        {/* Organización: perfil del establecimiento + agenda (horario y excepciones), cada uno en su página. */}
        {isTenantAdmin && <Route path="organizacion" element={<Navigate to="/organizacion/perfil" replace />} />}
        {isTenantAdmin && <Route path="organizacion/perfil" element={<OrganizationPage />} />}
        {isTenantAdmin && <Route path="organizacion/horario" element={<HorarioPage />} />}
        {isTenantAdmin && <Route path="organizacion/excepciones" element={<ExcepcionesPage />} />}
        {/* Compatibilidad con el enlace anterior /agenda. */}
        {isTenantAdmin && <Route path="agenda" element={<Navigate to="/organizacion/horario" replace />} />}

        {(isTenantAdmin || isPartner) && <Route path="citas" element={<AppointmentsPage />} />}

        {isGuest && <Route path="mis-reservas" element={<MyBookingsPage />} />}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
