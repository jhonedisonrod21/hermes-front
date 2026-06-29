import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { getMapProvider } from './mapProvider';
import type { GeocodeResult, MapHandle } from './types';

type MapPickerProps = {
  latitude?: number;
  longitude?: number;
  onChange?: (lat: number, lng: number) => void;
  /** Centro inicial (coordenadas) cuando aún no hay ubicación seleccionada. */
  defaultCenter?: { lat: number; lng: number };
  /** Texto a geocodificar para centrar el mapa al cargar si no hay coordenadas (p. ej. la ciudad). */
  baseQuery?: string;
  /** Solo lectura: muestra el marcador fijo, sin buscador, clic ni arrastre (p. ej. en una ficha). */
  readOnly?: boolean;
};

/** Métodos imperativos del MapPicker (vía ref). */
export type MapPickerHandle = {
  /** Geocodifica un texto (p. ej. una ciudad seleccionada) y mueve la ubicación allí. */
  goTo: (query: string) => void;
};

const FALLBACK_CENTER = { lat: 4.6536, lng: -74.0836 }; // Bogotá, D.C.

/**
 * Selector de ubicación en un mapa interactivo: el usuario busca una dirección o pincha/arrastra el
 * marcador, y se obtienen las coordenadas. Delega el render del mapa en el proveedor activo
 * ({@link getMapProvider}), de modo que cambiar a Google u otro no toca este componente.
 */
export const MapPicker = forwardRef<MapPickerHandle, MapPickerProps>(function MapPicker(
  { latitude, longitude, onChange, defaultCenter, baseQuery, readOnly = false },
  ref
) {
  const { t } = useTranslation(['organization', 'common']);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<MapHandle | null>(null);
  const onChangeRef = useRef(onChange ?? (() => {}));
  onChangeRef.current = onChange ?? (() => {});
  // Última posición emitida por el propio mapa: evita un bucle cuando el padre nos devuelve el valor.
  const lastEmitted = useRef('');

  // Centrado base por ciudad: se aplica una sola vez, solo si no hay coordenadas guardadas.
  const baseApplied = useRef(false);

  // Acción imperativa: al seleccionar una ciudad en el formulario, geocodificamos y movemos la
  // ubicación allí (marcador + vista) y la fijamos (commit). Solo se dispara por acción del usuario.
  useImperativeHandle(ref, () => ({
    goTo(rawQuery: string) {
      const q = rawQuery.trim();
      if (!q || !handleRef.current) return;
      getMapProvider()
        .search(q)
        .then((found) => {
          if (found.length === 0 || !handleRef.current) return;
          const { lat, lng } = found[0];
          lastEmitted.current = key(lat, lng);
          baseApplied.current = true; // ya hay ubicación: el centrado base no debe pisarla
          handleRef.current.setLocation(lat, lng);
          onChangeRef.current(lat, lng);
        })
        .catch(() => {
          /* ciudad no geocodificable: no movemos el mapa */
        });
    }
  }), []);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Montaje del mapa (una sola vez).
  useEffect(() => {
    if (!containerRef.current) return undefined;
    const start =
      latitude != null && longitude != null
        ? { lat: latitude, lng: longitude }
        : defaultCenter ?? FALLBACK_CENTER;
    const handle = getMapProvider().mount(containerRef.current, {
      lat: start.lat,
      lng: start.lng,
      zoom: latitude != null ? 15 : 12,
      interactive: !readOnly,
      onPick: (lat, lng) => {
        lastEmitted.current = key(lat, lng);
        onChangeRef.current(lat, lng);
      }
    });
    handleRef.current = handle;
    return () => {
      handle.destroy();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Centra el mapa en la ciudad (geocodificada) al cargar, solo si aún no hay coordenadas exactas.
  // Es una vista base: NO fija coordenadas (no dispara onChange); el usuario igual debe pinchar/arrastrar.
  useEffect(() => {
    if (baseApplied.current || !handleRef.current) return;
    if (latitude != null || longitude != null) {
      baseApplied.current = true; // ya hay ubicación: no recentramos por ciudad
      return;
    }
    const q = baseQuery?.trim();
    if (!q) return;
    baseApplied.current = true;
    let active = true;
    getMapProvider()
      .search(q)
      .then((found) => {
        if (active && found.length > 0) handleRef.current?.setLocation(found[0].lat, found[0].lng);
      })
      .catch(() => {
        /* sin centrado base: se queda en el centro por defecto */
      });
    return () => {
      active = false;
    };
  }, [baseQuery, latitude, longitude]);

  // Sincroniza el marcador cuando la ubicación llega/cambia desde fuera (p. ej. carga asíncrona del
  // perfil), sin reaccionar al cambio que originó el propio mapa.
  useEffect(() => {
    if (latitude == null || longitude == null || !handleRef.current) return;
    const k = key(latitude, longitude);
    if (k === lastEmitted.current) return;
    lastEmitted.current = k;
    handleRef.current.setLocation(latitude, longitude);
  }, [latitude, longitude]);

  async function runSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setNoResults(false);
    setResults([]);
    try {
      const found = await getMapProvider().search(q);
      setResults(found);
      setNoResults(found.length === 0);
    } catch {
      setNoResults(true);
    } finally {
      setSearching(false);
    }
  }

  function pick(result: GeocodeResult) {
    setResults([]);
    setQuery(result.label);
    lastEmitted.current = key(result.lat, result.lng);
    handleRef.current?.setLocation(result.lat, result.lng);
    onChange?.(result.lat, result.lng);
  }

  if (readOnly) {
    return (
      <div className="hc-map-field">
        <div ref={containerRef} className="hc-map-picker" role="img" aria-label={t('organization:map.ariaLabel')} />
      </div>
    );
  }

  return (
    <div className="hc-map-field">
      <form className="hc-map-search" onSubmit={runSearch} role="search">
        <span className="hc-input-shell hc-search">
          <span className="hc-input-icon"><Search size={18} /></span>
          <input
            type="search"
            placeholder={t('organization:map.searchPlaceholder')}
            aria-label={t('organization:map.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </span>
        <Button type="submit" variant="secondary" disabled={searching || !query.trim()}>
          {searching ? t('common:actions.saving') : t('organization:map.searchAction')}
        </Button>
      </form>

      {results.length > 0 ? (
        <ul className="hc-map-results">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng},${r.label}`}>
              <button type="button" onClick={() => pick(r)}>{r.label}</button>
            </li>
          ))}
        </ul>
      ) : null}
      {noResults ? <p className="hc-field-message">{t('organization:map.noResults')}</p> : null}

      <div
        ref={containerRef}
        className="hc-map-picker"
        role="application"
        aria-label={t('organization:map.ariaLabel')}
      />

      <p className="hc-field-message hc-map-caption">
        {latitude != null && longitude != null
          ? t('organization:map.selected', { lat: latitude.toFixed(5), lng: longitude.toFixed(5) })
          : t('organization:map.hint')}
      </p>
    </div>
  );
});

const key = (lat: number, lng: number) => `${lat.toFixed(6)},${lng.toFixed(6)}`;
