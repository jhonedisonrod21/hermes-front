import {
  Building2,
  CalendarCheck,
  CalendarRange,
  Compass,
  LayoutDashboard,
  Package,
  BarChart3,
  ShieldCheck,
  UsersRound,
  type LucideIcon
} from 'lucide-react';
import type { ActorKind } from '../hermes-security/sessionStore';

export type NavItem = {
  to: string;
  /** Clave i18n bajo el namespace `app` (app:nav.<key>). */
  key: string;
  icon: LucideIcon;
  end?: boolean;
  /** Modulo aun sin microservicio: se marca con un punto en la navegacion. */
  pending?: boolean;
};

const overview: NavItem = { to: '/', key: 'overview', icon: LayoutDashboard, end: true };

const navByActor: Record<ActorKind, NavItem[]> = {
  'system-admin': [
    overview,
    { to: '/admin/tenants', key: 'tenants', icon: Building2 },
    { to: '/admin/usuarios', key: 'users', icon: ShieldCheck }
  ],
  'tenant-admin': [
    overview,
    { to: '/catalogo', key: 'catalog', icon: Package },
    { to: '/agenda', key: 'schedule', icon: CalendarRange },
    { to: '/reportes', key: 'reports', icon: BarChart3, pending: true },
    { to: '/equipo', key: 'team', icon: UsersRound },
    { to: '/organizacion', key: 'organization', icon: Building2 }
  ],
  'tenant-partner': [
    overview,
    { to: '/citas', key: 'appointments', icon: CalendarCheck, pending: true }
  ],
  guest: [
    overview,
    { to: '/explorar', key: 'explore', icon: Compass },
    { to: '/mis-reservas', key: 'bookings', icon: CalendarCheck, pending: true }
  ]
};

export function navigationFor(actor: ActorKind): NavItem[] {
  return navByActor[actor];
}
