// Ciudades principales por país (código ISO alfa-2). Sirven como SUGERENCIAS de autocompletado
// (datalist): el campo sigue permitiendo texto libre para países o ciudades no listados.
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  CO: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Manizales', 'Villavicencio'],
  ES: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Bilbao', 'Alicante', 'Granada', 'Valladolid'],
  MX: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Querétaro', 'Mérida', 'Cancún', 'Toluca'],
  AR: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata', 'San Miguel de Tucumán', 'Salta'],
  CL: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Viña del Mar', 'Temuco'],
  PE: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco', 'Iquitos'],
  EC: ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Ambato', 'Manta'],
  VE: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana'],
  BO: ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba', 'Sucre', 'Oruro'],
  PY: ['Asunción', 'Ciudad del Este', 'Encarnación', 'San Lorenzo'],
  UY: ['Montevideo', 'Salto', 'Paysandú', 'Maldonado'],
  CR: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Liberia'],
  PA: ['Ciudad de Panamá', 'Colón', 'David', 'Santiago'],
  DO: ['Santo Domingo', 'Santiago de los Caballeros', 'La Romana', 'Punta Cana'],
  GT: ['Ciudad de Guatemala', 'Quetzaltenango', 'Escuintla', 'Antigua Guatemala'],
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Dallas', 'San Francisco', 'Boston'],
  BR: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Belo Horizonte', 'Curitiba', 'Recife']
};

/** Sugerencias de ciudades para un país. Lista vacía si no hay datos (el campo sigue siendo libre). */
export function citiesFor(countryCode: string): string[] {
  return CITIES_BY_COUNTRY[countryCode?.toUpperCase()] ?? [];
}
