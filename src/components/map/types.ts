/** Contrato de un proveedor de mapas para seleccionar una ubicación. Hoy lo implementa Leaflet+OSM;
 *  para integrar otro (Google, MapTiler…) basta con implementar esta interfaz y seleccionarlo en
 *  {@link ./mapProvider}. */

export type GeocodeResult = { lat: number; lng: number; label: string };

export type MountOptions = {
  lat: number;
  lng: number;
  zoom: number;
  /** Se invoca cuando el usuario elige una posición (clic en el mapa o arrastre del marcador). */
  onPick: (lat: number, lng: number) => void;
  /** Si es false, el mapa es de solo lectura: marcador fijo, sin clic ni arrastre. Por defecto true. */
  interactive?: boolean;
};

/** Manejador del mapa montado, para controlarlo desde React. */
export type MapHandle = {
  /** Coloca el marcador y centra el mapa (sin disparar onPick). */
  setLocation: (lat: number, lng: number) => void;
  /** Libera el mapa y sus listeners. */
  destroy: () => void;
};

export interface MapProvider {
  /** Monta un mapa interactivo en el contenedor y devuelve un manejador. */
  mount: (container: HTMLElement, options: MountOptions) => MapHandle;
  /** Geocoding: busca una dirección/lugar y devuelve coincidencias. */
  search: (query: string, signal?: AbortSignal) => Promise<GeocodeResult[]>;
}
