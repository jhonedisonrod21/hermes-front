import {
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  Package,
  BarChart3,
  Receipt,
  Settings2,
  ShieldCheck,
  UsersRound,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import type { ActorKind } from '../hermes-security/sessionStore';

export type NavItem = {
  /** Ruta destino. Opcional en un grupo padre (que solo despliega su submenú). */
  to?: string;
  /** Clave i18n bajo el namespace `app` (app:nav.<key>). */
  key: string;
  icon: LucideIcon;
  end?: boolean;
  /** Modulo aun sin microservicio: se marca con un punto en la navegacion. */
  pending?: boolean;
  /** Subelementos: si está presente, el ítem se renderiza como grupo desplegable. */
  children?: NavItem[];
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
    { to: '/citas', key: 'appointments', icon: CalendarCheck },
    { to: '/catalogo', key: 'catalog', icon: Package },
    // Organización agrupa el perfil del establecimiento y la agenda (horario + excepciones).
    {
      to: '/organizacion',
      key: 'organization',
      icon: Building2,
      children: [
        { to: '/organizacion/perfil', key: 'orgProfile', icon: Building2 },
        { to: '/organizacion/horario', key: 'orgHours', icon: CalendarRange },
        { to: '/organizacion/excepciones', key: 'orgExceptions', icon: CalendarClock }
      ]
    },
    { to: '/reportes', key: 'reports', icon: BarChart3 },
    // Pagos agrupa la configuración de la pasarela PSE y el historial de transacciones.
    {
      to: '/pagos',
      key: 'payments',
      icon: CreditCard,
      children: [
        { to: '/pagos/wompi', key: 'paymentsConfig', icon: Settings2 },
        { to: '/pagos/mercadopago', key: 'paymentsMercadoPago', icon: Wallet, pending: true },
        { to: '/pagos/historial', key: 'paymentsHistory', icon: Receipt }
      ]
    },
    { to: '/equipo', key: 'team', icon: UsersRound }
  ],
  'tenant-partner': [
    overview,
    { to: '/citas', key: 'appointments', icon: CalendarCheck }
  ],
  guest: [
    overview,
    { to: '/mis-reservas', key: 'bookings', icon: CalendarCheck, pending: true }
  ]
};

export function navigationFor(actor: ActorKind): NavItem[] {
  return navByActor[actor];
}

/** Aplana la navegación (incluye hijos) — útil para resolver etiquetas por ruta (p. ej. la miga de pan). */
export function flattenNav(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.children ? [item, ...item.children] : [item]));
}
