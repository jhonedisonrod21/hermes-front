import { leafletProvider } from './leafletProvider';
import type { MapProvider } from './types';

/**
 * Devuelve el proveedor de mapas activo. Hoy Leaflet + OpenStreetMap; para cambiar a otro
 * (Google Maps, MapTiler, Mapbox…) basta implementar {@link MapProvider} y seleccionarlo aquí
 * (por ejemplo según una variable de entorno `import.meta.env.VITE_MAP_PROVIDER`).
 */
export function getMapProvider(): MapProvider {
  return leafletProvider;
}
