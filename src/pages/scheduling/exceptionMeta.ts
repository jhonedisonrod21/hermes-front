import type { DayOfWeek, ScheduleExceptionType } from '../../api/types';

/** Color del bloque de cada excepción en el calendario (paleta de marca, tonos sobrios por tipo). */
export const TYPE_COLOR: Record<ScheduleExceptionType, string> = {
  CLOSED: '#0d347a', // azul de marca (cerrado: festivo / vacaciones / emergencia)
  SPECIAL_HOURS: '#0e7490' // teal sobrio (jornada con horario especial)
};

export const TYPE_TONE: Record<ScheduleExceptionType, 'info'> = {
  CLOSED: 'info',
  SPECIAL_HOURS: 'info'
};

/** Color del marcador "No laboral" (día fuera del horario de atención). Solo presentación. */
export const NONWORKING_COLOR = '#64748b'; // slate, neutro pero visible

/** Día de la semana (enum del backend) de una fecha local. Índice JS: 0=domingo … 6=sábado. */
const DAYS_OF_WEEK: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
export function dayOfWeekOf(date: Date): DayOfWeek {
  return DAYS_OF_WEEK[date.getDay()];
}

/** Fecha local (no UTC) a partir de un ISO 'yyyy-MM-dd', para no desplazar el día por zona horaria. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 'yyyy-MM-dd' de una fecha local (independiente de zona horaria). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
