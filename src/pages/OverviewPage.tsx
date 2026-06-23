import type { ReactNode } from 'react';
import { Building2, CalendarCheck, CalendarRange, Compass, Package, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/PageHeader';
import { Badge, Card } from '../components/ui';
import { HermesDial } from '../components/HermesDial';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../hermes-security/useAuth';
import { actorKind, type ActorKind, type HermesProfile } from '../hermes-security/sessionStore';
import { catalogApi, identityApi, tenantApi } from '../api/services';

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <Card className="summary-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}

function dash(loading: boolean, value: number | undefined) {
  if (loading) return '…';
  return value ?? '—';
}

function TenantOverview() {
  const { t } = useTranslation('overview');
  const offerings = useResource(() => catalogApi.listOfferings({ size: 200 }), []);
  const members = useResource(() => tenantApi.listMyMembers({ size: 1 }), []);
  const total = offerings.data?.totalElements;
  const active = offerings.data?.content.filter((o) => o.active).length;

  return (
    <section className="summary-grid">
      <MetricCard icon={<Package size={22} />} label={t('tenant.offerings')} value={dash(offerings.loading, total)} />
      <MetricCard icon={<CalendarRange size={22} />} label={t('tenant.activeOfferings')} value={dash(offerings.loading, active)} />
      <MetricCard icon={<UsersRound size={22} />} label={t('tenant.members')} value={dash(members.loading, members.data?.totalElements)} />
    </section>
  );
}

function AdminOverview() {
  const { t } = useTranslation('overview');
  const tenants = useResource(() => tenantApi.listTenants({ size: 1 }), []);
  const users = useResource(() => identityApi.listUsers({ size: 1 }), []);
  return (
    <section className="summary-grid">
      <MetricCard icon={<Building2 size={22} />} label={t('admin.tenants')} value={dash(tenants.loading, tenants.data?.totalElements)} />
      <MetricCard icon={<ShieldCheck size={22} />} label={t('admin.users')} value={dash(users.loading, users.data?.totalElements)} />
    </section>
  );
}

const QUICK_LINKS: Record<ActorKind, { to: string; key: string; icon: ReactNode }[]> = {
  'tenant-admin': [
    { to: '/catalogo', key: 'catalog', icon: <Package size={18} /> },
    { to: '/agenda', key: 'schedule', icon: <CalendarRange size={18} /> },
    { to: '/equipo', key: 'team', icon: <UsersRound size={18} /> }
  ],
  'tenant-partner': [{ to: '/citas', key: 'appointments', icon: <CalendarCheck size={18} /> }],
  'system-admin': [
    { to: '/admin/tenants', key: 'tenants', icon: <Building2 size={18} /> },
    { to: '/admin/usuarios', key: 'users', icon: <ShieldCheck size={18} /> }
  ],
  guest: [
    { to: '/explorar', key: 'explore', icon: <Compass size={18} /> },
    { to: '/mis-reservas', key: 'bookings', icon: <CalendarCheck size={18} /> }
  ]
};

function workspaceLabel(kind: ActorKind, profile: HermesProfile | undefined, t: (k: string) => string) {
  if (kind === 'system-admin') return t('fallback.systemAdmin');
  if (kind === 'guest') return t('fallback.guest');
  return profile?.tenant_name ?? profile?.tenant_slug ?? t('fallback.tenant');
}

export function OverviewPage() {
  const { t } = useTranslation(['overview', 'dashboard']);
  const { session } = useAuth();
  const profile = session?.profile;
  const kind = actorKind(profile);
  const userLabel = profile?.email ?? profile?.preferred_username ?? profile?.sub ?? t('overview:fallback.user');

  return (
    <div className="page">
      <PageHeader eyebrow={t('overview:eyebrow')} title={t('overview:greeting', { name: userLabel })} />

      <Card className="dashboard-hero" tone="highlight">
        <div>
          <Badge tone="success">{t('overview:sessionActive')}</Badge>
          <h1>{workspaceLabel(kind, profile, (k) => t(`overview:${k}`))}</h1>
          <p>{t(`overview:intro.${kind}`)}</p>
        </div>
        <HermesDial className="dashboard-hero-dial" labels={false} />
      </Card>

      {kind === 'tenant-admin' ? <TenantOverview /> : null}
      {kind === 'system-admin' ? <AdminOverview /> : null}

      <Card className="panel">
        <h2 className="quicklinks-title">{t('overview:quickLinks')}</h2>
        <div className="quicklinks">
          {QUICK_LINKS[kind].map((l) => (
            <Link key={l.to} to={l.to} className="quicklink">
              {l.icon}
              <span>{t(`overview:links.${l.key}`)}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
