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
  timeZone?: string;
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
  timeZone?: string;
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
  timeZone?: string;
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

export type UserUpdateRequest = { username: string; email: string; phone?: string };

export type UserLockRequest = { locked: boolean };

// ---- Perfil propio (hermes-identity-service /me) ----
export type SelfProfileResponse = {
  id: string;
  username: string;
  email: string;
  phone?: string;
  roles: string[];
};

export type SelfProfileUpdateRequest = { phone?: string };

/** Ficha mínima de un usuario para resolver id -> nombre en pantallas de citas/pagos. */
export type UserCard = { id: string; username: string; email: string };

// ---- Cambio / recuperación de contraseña (público en el gateway) ----
export type PasswordResetRequest = { email: string };
export type PasswordResetConfirmRequest = { token: string; newPassword: string };

// ---- Organizaciones del usuario / cambio de tenant activo (multi-tenant) ----
export type OrganizationResponse = {
  tenantId: string;
  slug: string;
  name: string;
  roles: string[];
};

/** Token re-emitido al cambiar de organización. Lo consume el BFF (no el front directamente). */
export type SwitchTokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  tenantId: string;
  tenantName: string;
  roles: string[];
};

// ---- Citas (hermes-scheduling-service) ----
export type AppointmentStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'EXPIRED';

export type AvailableSlot = { start: string; end: string };

export type AppointmentBookingRequest = {
  offeringId: string;
  slotStart: string;
  requirementValues?: Record<string, string>;
};

export type RescheduleRequest = { newSlotStart: string };

export type AppointmentResponse = {
  id: string;
  tenantId: string;
  offeringId: string;
  customerUserId: string;
  slotStart: string;
  slotEnd: string;
  status: AppointmentStatus;
  priceAmount?: number;
  priceCurrency?: string;
  requiresOnlinePayment?: boolean;
  requirementValues: Record<string, string>;
  createdAt?: string;
};

// ---- Pagos PSE (hermes-payment-service) ----
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
export type PaymentProvider = 'FAKE_PSE' | 'WOMPI' | 'PAYU';

export type FinancialInstitution = { code: string; name: string };

export type PayerInfo = {
  legalType: string; // NATURAL | JURIDICAL
  documentType: string; // CC, NIT, CE...
  documentNumber: string;
  fullName: string;
  email: string;
  phone: string;
};

export type CheckoutRequest = {
  appointmentId: string;
  financialInstitutionCode: string;
  payer: PayerInfo;
};

export type CheckoutResponse = { paymentId: string; status: PaymentStatus; checkoutUrl: string };

export type PaymentResponse = {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  checkoutUrl?: string;
  createdAt: string;
};

export type TenantPaymentConfigRequest = {
  provider: PaymentProvider;
  merchantAccount?: string;
  publicKey?: string;
  privateKey?: string; // solo escritura
  eventsSecret?: string; // solo escritura
  enabled?: boolean;
};

export type TenantPaymentConfigResponse = {
  provider: PaymentProvider;
  merchantAccount?: string;
  publicKey?: string;
  enabled: boolean;
  privateKeyConfigured: boolean;
  eventsSecretConfigured: boolean;
  updatedAt: string;
};
