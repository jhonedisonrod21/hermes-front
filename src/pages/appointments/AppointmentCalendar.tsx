import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, type View, type Messages } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';
import type { AppointmentResponse } from '../../api/types';
import { STATUS_COLOR } from './appointmentMeta';

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  appointment: AppointmentResponse;
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { es, en: enUS }
});

type Props = {
  events: CalendarEvent[];
  date: Date;
  view: View;
  onView: (view: View) => void;
  onNavigate: (date: Date) => void;
  onSelectEvent: (appointment: AppointmentResponse) => void;
};

/**
 * Vista calendario de citas (mes/semana/día) sobre react-big-calendar. Es presentacional: recibe los
 * eventos ya mapeados y delega navegación/selección al contenedor. El color del bloque sigue el estado
 * de la cita (paleta de marca en {@link STATUS_COLOR}).
 */
export function AppointmentCalendar({ events, date, view, onView, onNavigate, onSelectEvent }: Props) {
  const { t, i18n } = useTranslation(['appointments', 'common']);
  const culture = i18n.language.startsWith('es') ? 'es' : 'en';

  const messages: Messages<CalendarEvent> = useMemo(
    () => ({
      today: t('appointments:calendar.today'),
      previous: t('appointments:calendar.previous'),
      next: t('appointments:calendar.next'),
      month: t('appointments:calendar.month'),
      week: t('appointments:calendar.week'),
      day: t('appointments:calendar.day'),
      date: t('appointments:columns.start'),
      event: t('appointments:calendar.event'),
      noEventsInRange: t('appointments:calendar.noEvents'),
      showMore: (count: number) => t('appointments:calendar.showMore', { count })
    }),
    [t]
  );

  return (
    <div className="hc-calendar">
      <Calendar<CalendarEvent>
        localizer={localizer}
        culture={culture}
        events={events}
        date={date}
        view={view}
        onView={onView}
        onNavigate={onNavigate}
        views={['month', 'week', 'day']}
        popup
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        onSelectEvent={(e) => onSelectEvent(e.appointment)}
        eventPropGetter={(e) => ({
          style: { backgroundColor: STATUS_COLOR[e.appointment.status], borderColor: STATUS_COLOR[e.appointment.status] }
        })}
      />
    </div>
  );
}
