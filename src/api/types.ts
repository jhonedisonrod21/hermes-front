// Tipos de dominio derivados de los contratos OpenAPI de los microservicios Hermes.

// ---- Catálogo (hermes-catalog-service) ----
export type OfferingModality = 'IN_PERSON' | 'VIRTUAL' | 'BOTH';

export type RequirementDto = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  displayOrder: number;
};

export type OfferingRequest = {
  name: string;
  description?: string;
  category?: string;
  durationMinutes: number;
  modality: string;
  priceAmount: number;
  priceCurrency: string;
  requiresOnlinePayment: boolean;
  requirements?: RequirementDto[];
};

export type OfferingResponse = {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category?: string;
  durationMinutes: number;
  modality: string;
  priceAmount: number;
  priceCurrency: string;
  requiresOnlinePayment: boolean;
  active: boolean;
  requirements: RequirementDto[];
  createdAt: string;
  updatedAt: string;
};

export type OfferingSearchResult = {
  id: string;
  tenantId: string;
  tenantSlug?: string;
  tenantName?: string;
  name: string;
  description?: string;
  category?: string;
  durationMinutes: number;
  modality: string;
  priceAmount: number;
  priceCurrency: string;
  requiresOnlinePayment: boolean;
  requirements: RequirementDto[];
};

// ---- Agenda (hermes-scheduling-service) ----
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type BusinessHoursDto = {
  dayOfWeek: DayOfWeek;
  opensAt: string; // HH:mm
  closesAt: string; // HH:mm
};

export type BusinessScheduleRequest = {
  hours: BusinessHoursDto[];
};

export type ScheduleExceptionType = 'CLOSED' | 'SPECIAL_HOURS';

export type ScheduleExceptionRequest = {
  date: string; // ISO date
  type: string;
  opensAt?: string;
  closesAt?: string;
  description?: string;
};

export type ScheduleExceptionResponse = {
  id: string;
  date: string;
  type: string;
  opensAt?: string;
  closesAt?: string;
  description?: string;
  createdAt: string;
};

// ---- Tenant (hermes-tenant-service) ----
export type GeoPointDto = { latitude: number; longitude: number };

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | string;

export type TenantResponse = {
  id: string;
  slug: string;
  name: string;
  taxId?: string;
  country?: string;
  city?: string;
  address?: string;
  description?: string;
  location?: GeoPointDto;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
};

export type TenantUpdateRequest = {
  name: string;
  taxId?: string;
  country?: string;
  city?: string;
  address?: string;
  description?: string;
  location?: GeoPointDto;
};

export type TenantCreateRequest = {
  name: string;
  taxId?: string;
  country?: string;
  city?: string;
  address?: string;
  description?: string;
  location?: GeoPointDto;
};

export type TenantStatusUpdateRequest = { status: string };

/** Campos que el TENANT_ADMIN puede modificar de su propio establecimiento vía `/tenant/me`. */
export type TenantContactUpdateRequest = {
  taxId: string;
  address?: string;
  description?: string;
  location?: GeoPointDto;
};

export type MembershipResponse = {
  id: string;
  userId: string;
  tenantId: string;
  tenantSlug: string;
  roles: string[];
  status: string;
  createdAt: string;
};

export type MembershipCreateRequest = { userId: string; role: string };

// ---- Identidad (hermes-identity-service) ----
export type UserResponse = {
  id: string;
  username: string;
  email: string;
  enabled: boolean;
  locked: boolean;
  roles: string[];
  createdAt: string;
};

export type UserUpdateRequest = { username: string; email: string };

export type UserLockRequest = { locked: boolean };
