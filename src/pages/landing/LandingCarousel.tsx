import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  AlarmClock,
  Calendar,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  type LucideIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DECOR_ICONS = [Calendar, Clock, CalendarDays, AlarmClock, CalendarClock];
const DECOR_COUNT = 6;

type DecorItem = { key: string; size: number; style: CSSProperties } & ({ Icon: LucideIcon } | { logo: true });

const rnd = (min: number, max: number) => min + Math.random() * (max - min);

/** Estilo flotante aleatorio: posición, ritmo, trayectoria (3 puntos) y giro continuo, fijos por montaje. */
function randomFloatStyle(): CSSProperties {
  const px = () => `${Math.round(rnd(-52, 56))}px`;
  const dir = Math.random() < 0.5 ? 1 : -1;
  return {
    top: `${rnd(6, 70).toFixed(1)}%`,
    left: `${rnd(6, 78).toFixed(1)}%`,
    animationDuration: `${rnd(11, 22).toFixed(1)}s`,
    animationDelay: `-${rnd(0, 12).toFixed(1)}s`,
    '--x1': px(), '--y1': px(), '--x2': px(), '--y2': px(), '--x3': px(), '--y3': px(),
    '--r1': `${dir * 90}deg`, '--r2': `${dir * 180}deg`, '--r3': `${dir * 270}deg`, '--rend': `${dir * 360}deg`
  } as CSSProperties;
}

/** Adornos dorados (calendarios/relojes) + el logo de Hermes, cada uno con parámetros aleatorios. */
function buildDecor(): DecorItem[] {
  const icons: DecorItem[] = Array.from({ length: DECOR_COUNT }, (_, i) => ({
    key: `icon-${i}`,
    Icon: DECOR_ICONS[Math.floor(Math.random() * DECOR_ICONS.length)],
    size: Math.round(rnd(22, 38)),
    style: randomFloatStyle()
  }));
  // Logos de Hermes: el doble de tamaño que los iconos (≈44–76px), 4 en total.
  const logos: DecorItem[] = Array.from({ length: 4 }, (_, i) => ({
    key: `logo-${i}`,
    logo: true,
    size: Math.round(rnd(44, 76)),
    style: randomFloatStyle()
  }));
  return [...icons, ...logos];
}

/** Tarjetas del carrusel: una figura (humaaans) + un mensaje. */
const SLIDES = [
  { key: 'book', img: '/humaaans/standing-1.svg' },
  { key: 'anywhere', img: '/humaaans/standing-9.svg' },
  { key: 'pay', img: '/humaaans/sitting-3.svg' },
  { key: 'manage', img: '/humaaans/standing-6.svg' },
  { key: 'org', img: '/humaaans/standing-14.svg' }
] as const;

const AUTO_MS = 6000;

/**
 * Carrusel del landing: varias tarjetas, cada una con una figura ilustrada y un mensaje. Avanza solo
 * cada 6s (se pausa al pasar el cursor) y permite navegar con flechas o puntos.
 */
export function LandingCarousel() {
  const { t } = useTranslation('landing');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;
  // Adornos aleatorios fijos para esta sesión (cada icono con su trayectoria/giro propios).
  const decor = useMemo(buildDecor, []);

  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  // Auto-avance, pausado al pasar el cursor o si la pestaña no está visible.
  useEffect(() => {
    if (paused) return undefined;
    const id = globalThis.setInterval(() => setIndex((i) => (i + 1) % count), AUTO_MS);
    return () => globalThis.clearInterval(id);
  }, [paused, count]);

  return (
    <section
      className="lp-carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        className="lp-carousel-nav lp-carousel-prev"
        onClick={() => go(index - 1)}
        aria-label={t('carousel.prev')}
      >
        <ChevronLeft size={22} />
      </button>

      <div className="lp-carousel-viewport">
        <div className="lp-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((s, i) => (
            <article
              className={`lp-slide ${i === index ? 'is-active' : ''}`.trim()}
              key={s.key}
              aria-roledescription="slide"
            >
              <div className="lp-slide-figure">
                <div className="lp-slide-decor" aria-hidden="true">
                  {decor.map((d) =>
                    'logo' in d ? (
                      <img
                        key={d.key}
                        className="lp-float lp-float-logo"
                        src="/brand/hermes-logo-minimalista.svg"
                        alt=""
                        width={d.size}
                        height={d.size}
                        style={d.style}
                      />
                    ) : (
                      <d.Icon key={d.key} className="lp-float" size={d.size} style={d.style} />
                    )
                  )}
                </div>
                <img src={s.img} alt="" aria-hidden="true" />
              </div>
              <div className="lp-slide-msg">
                <h2>{t(`carousel.slides.${s.key}.title`)}</h2>
                <p>{t(`carousel.slides.${s.key}.body`)}</p>
                <p className="lp-slide-note">{t(`carousel.slides.${s.key}.note`)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="lp-carousel-nav lp-carousel-next"
        onClick={() => go(index + 1)}
        aria-label={t('carousel.next')}
      >
        <ChevronRight size={22} />
      </button>

      <div className="lp-carousel-dots" role="tablist">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={t('carousel.goTo', { n: i + 1 })}
            className={i === index ? 'is-active' : ''}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
