import type { AppointmentStatus } from '../../api/types';

export const STATUSES: AppointmentStatus[] = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'EXPIRED'
];

export const STATUS_TONE: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
  EXPIRED: 'warning'
};

/** Estados sobre los que aún se puede actuar (cancelar / reprogramar). */
export const ACTIVE: AppointmentStatus[] = ['PENDING_PAYMENT', 'CONFIRMED'];

/**
 * Color del bloque de cada cita en el calendario, alineado con los tonos de los badges. Se aplica como
 * variable CSS (--appt-color) sobre cada evento para respetar la paleta de la marca.
 */
export const STATUS_COLOR: Record<AppointmentStatus, string> = {
  PENDING_PAYMENT: '#b45309', // ámbar (pendiente de pago)
  CONFIRMED: '#1d4ed8', // azul de marca (confirmada)
  COMPLETED: '#15803d', // verde (atendida)
  CANCELLED: '#b91c1c', // rojo (cancelada)
  NO_SHOW: '#9f1239', // rosa oscuro (no presentado)
  EXPIRED: '#6b7280' // gris (expirada)
};
