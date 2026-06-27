import { useMemo, type ReactNode } from 'react';
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  Clock,
  Compass,
  CreditCard,
  Package,
  ShieldCheck,
  UsersRound
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/PageHeader';
import { Badge, Card } from '../components/ui';
import { HermesDial } from '../components/HermesDial';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../hermes-security/useAuth';
import { actorKind, type ActorKind, type HermesProfile } from '../hermes-security/sessionStore';
import { appointmentsApi, catalogApi, identityApi, tenantApi, tenantAppointmentsApi } from '../api/services';
import type { AppointmentStatus } from '../api/types';
import { formatDateTime } from '../lib/format';

function MetricCard({ icon, label, value, to }: { icon: ReactNode; label: string; value: ReactNode; to?: string }) {
  const card = (
    <Card className={`summary-card${to ? ' summary-card-link' : ''}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
  return to ? (
    <Link to={to} className="summary-card-wrap">
      {card}
    </Link>
  ) : (
    card
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
      <MetricCard icon={<Building2 size={22} />} label={t('admin.tenants')} value={dash(tenants.loading, tenants.data?.totalElements)} to="/admin/tenants" />
      <MetricCard icon={<ShieldCheck size={22} />} label={t('admin.users')} value={dash(users.loading, users.data?.totalElements)} to="/admin/usuarios" />
    </section>
  );
}

const GUEST_TONE: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
  EXPIRED: 'warning'
};

/** Vista de inicio del invitado: su próxima cita (o invitación a explorar) + métricas útiles. */
function GuestOverview() {
  const { t, i18n } = useTranslation(['overview', 'appointments']);
  const appts = useResource(() => appointmentsApi.listMine({ size: 100, sort: 'slotStart,asc' }), []);
  const items = useMemo(() => appts.data?.content ?? [], [appts.data]);
  const now = Date.now();
  const upcoming = useMemo(
    () =>
      items.filter(
        (a) =>
          (a.status === 'CONFIRMED' || a.status === 'PENDING_PAYMENT') &&
          new Date(a.slotStart).getTime() > now
      ),
    [items, now]
  );
  const pendingPay = useMemo(() => items.filter((a) => a.status === 'PENDING_PAYMENT').length, [items]);
  const next = upcoming[0];

  // Partes de la fecha para la "casilla de fecha" + meta de la próxima cita.
  const when = next ? new Date(next.slotStart) : null;
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    when ? new Intl.DateTimeFormat(i18n.language, opts).format(when) : '';
  const nextDay = fmt({ day: '2-digit' });
  const nextMonth = fmt({ month: 'short' }).replace('.', '');
  const nextDayTime = fmt({ weekday: 'long', hour: '2-digit', minute: '2-digit' });

  // Resuelve el nombre del servicio de la próxima cita (el invitado lo lee del detalle público).
  const offering = useResource(
    () => (next ? catalogApi.getPublicOffering(next.offeringId).catch(() => null) : Promise.resolve(null)),
    [next?.offeringId]
  );

  return (
    <section className="guest-board">
      {appts.loading ? (
        <Card className="guest-next is-loading">
          <span className="guest-next-eyebrow">{t('overview:guest.next')}</span>
          <strong>…</strong>
        </Card>
      ) : next ? (
        <Card className="guest-next">
          <div className="guest-next-date" aria-hidden="true">
            <span className="guest-next-day">{nextDay}</span>
            <span className="guest-next-month">{nextMonth}</span>
          </div>
          <div className="guest-next-info">
            <span className="guest-next-eyebrow">{t('overview:guest.next')}</span>
            <strong>{offering.data?.name ?? t('overview:guest.service')}</strong>
            <span className="guest-next-meta">
              <span className="guest-next-when">
                <Clock size={15} /> {nextDayTime}
              </span>
              <Badge tone={GUEST_TONE[next.status]}>{t(`appointments:status.${next.status}`)}</Badge>
            </span>
          </div>
          <Link to="/mis-reservas" className="hc-button hc-button-primary hc-button-md guest-next-cta">
            <span className="hc-button-icon">
              {next.status === 'PENDING_PAYMENT' ? <CreditCard size={17} /> : <CalendarCheck size={17} />}
            </span>
            <span>{next.status === 'PENDING_PAYMENT' ? t('overview:guest.payNow') : t('overview:guest.viewBooking')}</span>
          </Link>
        </Card>
      ) : (
        <Card className="guest-empty">
          <span className="guest-empty-mark"><Compass size={26} /></span>
          <strong>{t('overview:guest.noNext')}</strong>
          <p>{t('overview:guest.noNextHint')}</p>
          <Link to="/explorar" className="hc-button hc-button-primary hc-button-md">
            <span className="hc-button-icon"><Compass size={17} /></span>
            <span>{t('overview:guest.exploreCta')}</span>
          </Link>
        </Card>
      )}

      <div className="summary-grid guest-metrics">
        <MetricCard icon={<CalendarCheck size={22} />} label={t('overview:guest.upcoming')} value={dash(appts.loading, upcoming.length)} />
        <MetricCard icon={<CreditCard size={22} />} label={t('overview:guest.pendingPayment')} value={dash(appts.loading, pendingPay)} />
      </div>
    </section>
  );
}

const ACTIVE_STATUSES: AppointmentStatus[] = ['PENDING_PAYMENT', 'CONFIRMED'];

function isLocalToday(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

/** Resumen operativo del colaborador: métricas del día + próximas citas del establecimiento. */
function PartnerOverview() {
  const { t, i18n } = useTranslation(['overview', 'appointments']);
  const appts = useResource(() => tenantAppointmentsApi.list({ size: 200, sort: 'slotStart,asc' }), []);
  const offerings = useResource(() => catalogApi.listOfferings({ size: 200 }), []);
  const items = useMemo(() => appts.data?.content ?? [], [appts.data]);

  const offeringName = useMemo(() => {
    const map = new Map((offerings.data?.content ?? []).map((o) => [o.id, o.name]));
    return (id: string) => map.get(id) ?? id.slice(0, 8);
  }, [offerings.data]);

  // Resuelve el correo del cliente (id -> ficha) en lote desde el directorio del tenant.
  const customerIdsKey = useMemo(() => [...new Set(items.map((a) => a.customerUserId))].sort().join(','), [items]);
  const customers = useResource(
    () => (customerIdsKey ? identityApi.getUserCards(customerIdsKey.split(',').slice(0, 100)) : Promise.resolve([])),
    [customerIdsKey]
  );
  const customerLabel = useMemo(() => {
    const map = new Map((customers.data ?? []).map((c) => [c.id, c]));
    return (id: string) => map.get(id)?.email || map.get(id)?.username || `${id.slice(0, 8)}…`;
  }, [customers.data]);

  const now = new Date();
  const todayCount = useMemo(
    () => items.filter((a) => ACTIVE_STATUSES.includes(a.status) && isLocalToday(a.slotStart, now)).length,
    [items, now]
  );
  const upcoming = useMemo(
    () =>
      items
        .filter((a) => a.status === 'CONFIRMED' && new Date(a.slotStart).getTime() >= now.getTime())
        .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime()),
    [items, now]
  );
  const pendingPay = useMemo(() => items.filter((a) => a.status === 'PENDING_PAYMENT').length, [items]);
  const nextFew = upcoming.slice(0, 5);

  return (
    <section className="partner-board">
      <div className="summary-grid partner-metrics">
        <MetricCard icon={<CalendarClock size={22} />} label={t('overview:partner.today')} value={dash(appts.loading, todayCount)} to="/citas" />
        <MetricCard icon={<CalendarCheck size={22} />} label={t('overview:partner.upcoming')} value={dash(appts.loading, upcoming.length)} to="/citas" />
        <MetricCard icon={<CreditCard size={22} />} label={t('overview:partner.pendingPayment')} value={dash(appts.loading, pendingPay)} to="/citas" />
      </div>

      <Card className="panel">
        <div className="partner-next-head">
          <h2 className="quicklinks-title">{t('overview:partner.next')}</h2>
          <Link to="/citas" className="hc-button hc-button-ghost hc-button-sm">
            <span>{t('overview:partner.viewAll')}</span>
          </Link>
        </div>
        {appts.loading ? (
          <p className="account-hint">{t('overview:partner.loading')}</p>
        ) : nextFew.length > 0 ? (
          <ul className="agenda-list">
            {nextFew.map((a) => (
              <li className="agenda-row" key={a.id}>
                <span className="agenda-when">{formatDateTime(a.slotStart, i18n.language)}</span>
                <div className="agenda-main">
                  <strong>{offeringName(a.offeringId)}</strong>
                  <span className="agenda-customer">{customerLabel(a.customerUserId)}</span>
                </div>
                <Badge tone={GUEST_TONE[a.status]}>{t(`appointments:status.${a.status}`)}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="account-hint">{t('overview:partner.noUpcoming')}</p>
        )}
      </Card>
    </section>
  );
}

/** Nombre amable a partir del perfil: prioriza usuario, luego la parte local del correo. */
function displayName(profile: HermesProfile | undefined, fallback: string) {
  const raw = profile?.preferred_username || profile?.email || profile?.sub || fallback;
  const local = raw.includes('@') ? raw.split('@')[0] : raw;
  return local.replace(/[._-]+/g, ' ').replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

const QUICK_LINKS: Record<ActorKind, { to: string; key: string; icon: ReactNode }[]> = {
  'tenant-admin': [
    { to: '/catalogo', key: 'catalog', icon: <Package size={18} /> },
    { to: '/agenda', key: 'schedule', icon: <CalendarRange size={18} /> },
    { to: '/citas', key: 'appointments', icon: <CalendarCheck size={18} /> },
    { to: '/pagos', key: 'payments', icon: <CreditCard size={18} /> },
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
  const userLabel = displayName(profile, t('overview:fallback.user'));

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
      {kind === 'tenant-partner' ? <PartnerOverview /> : null}
      {kind === 'system-admin' ? <AdminOverview /> : null}
      {kind === 'guest' ? <GuestOverview /> : null}

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
