import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { GeocodeResult, MapHandle, MapProvider, MountOptions } from './types';

// El icono por defecto de Leaflet no renderiza con bundlers: su `_getIconUrl` antepone un `imagePath`
// detectado del CSS a la URL del icono, produciendo una ruta inválida (404) con los assets de Vite.
// Creamos un icono explícito con las URLs importadas (Vite las resuelve) y lo pasamos al marcador,
// evitando por completo Icon.Default. Tamaños/anclas son los estándar de Leaflet.
const DEFAULT_ICON = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
// Geocoder gratuito de OSM. Política de uso: bajo volumen (apto para MVP/demo); en producción
// conviene un proveedor con free tier + key.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/** Proveedor de mapa basado en Leaflet + teselas de OpenStreetMap + geocoding Nominatim. */
export const leafletProvider: MapProvider = {
  mount(container: HTMLElement, { lat, lng, zoom, onPick, interactive = true }: MountOptions): MapHandle {
    const map = L.map(container).setView([lat, lng], zoom);
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: interactive, icon: DEFAULT_ICON }).addTo(map);
    if (interactive) {
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onPick(position.lat, position.lng);
      });
      map.on('click', (event: L.LeafletMouseEvent) => {
        marker.setLatLng(event.latlng);
        onPick(event.latlng.lat, event.latlng.lng);
      });
    }

    // El contenedor puede montarse con tamaño aún sin calcular; recalculamos al siguiente tick.
    setTimeout(() => map.invalidateSize(), 0);

    return {
      setLocation(newLat: number, newLng: number) {
        marker.setLatLng([newLat, newLng]);
        map.setView([newLat, newLng], Math.max(map.getZoom(), 15));
      },
      destroy() {
        map.remove();
      }
    };
  },

  async search(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
    const url = `${NOMINATIM_URL}?format=jsonv2&limit=5&addressdetails=0&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    return data
      .map((item): GeocodeResult => ({ lat: Number(item.lat), lng: Number(item.lon), label: item.display_name }))
      .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
  }
};
