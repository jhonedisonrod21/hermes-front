import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, type SlotInfo, type Messages } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';
import type { ScheduleExceptionResponse } from '../../api/types';
import { TYPE_COLOR, NONWORKING_COLOR } from './exceptionMeta';

export type ExceptionEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: true;
  /** Excepción real, o null para el marcador virtual "No laboral" (solo presentación). */
  exception: ScheduleExceptionResponse | null;
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { es, en: enUS }
});

type Props = {
  events: ExceptionEvent[];
  date: Date;
  onNavigate: (date: Date) => void;
  onSelectSlot: (slot: SlotInfo) => void;
  onSelectEvent: (exception: ScheduleExceptionResponse) => void;
};

/**
 * Calendario mensual de excepciones (cierres y jornadas especiales). Solo vista mes: cada excepción es
 * un evento de día completo y se puede hacer clic en un día (o arrastrar varios) para marcar nuevos.
 * Los días no laborables llegan como eventos virtuales (exception null) que no son clicables.
 */
export function ExceptionCalendar({ events, date, onNavigate, onSelectSlot, onSelectEvent }: Props) {
  const { t, i18n } = useTranslation(['schedule', 'appointments']);
  const culture = i18n.language.startsWith('es') ? 'es' : 'en';

  const messages: Messages<ExceptionEvent> = useMemo(
    () => ({
      today: t('appointments:calendar.today'),
      previous: t('appointments:calendar.previous'),
      next: t('appointments:calendar.next'),
      month: t('appointments:calendar.month'),
      showMore: (count: number) => t('appointments:calendar.showMore', { count }),
      noEventsInRange: t('schedule:exceptions.noEvents')
    }),
    [t]
  );

  return (
    <div className="hc-calendar hc-calendar-month">
      <Calendar<ExceptionEvent>
        localizer={localizer}
        culture={culture}
        events={events}
        date={date}
        view="month"
        views={['month']}
        onView={() => {}}
        onNavigate={onNavigate}
        selectable
        longPressThreshold={20}
        messages={messages}
        onSelectSlot={onSelectSlot}
        onSelectEvent={(e) => (e.exception ? onSelectEvent(e.exception) : undefined)}
        eventPropGetter={(e) => {
          // Marcador virtual "No laboral": color neutro y sin captura de clics (className), de modo que
          // al hacer clic en el día se siga abriendo el modal para marcarlo como excepción.
          if (!e.exception) {
            return { className: 'rbc-nonworking-event', style: { backgroundColor: NONWORKING_COLOR, borderColor: NONWORKING_COLOR } };
          }
          const color = TYPE_COLOR[e.exception.type as keyof typeof TYPE_COLOR];
          return { style: { backgroundColor: color, borderColor: color } };
        }}
      />
    </div>
  );
}
