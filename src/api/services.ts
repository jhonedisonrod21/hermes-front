import { api, ApiError, buildQuery, fetchBlob, type Page } from './http';
import type {
  AppointmentBookingRequest,
  AppointmentResponse,
  AvailableSlot,
  BusinessHoursDto,
  BusinessScheduleRequest,
  CheckoutRequest,
  CheckoutResponse,
  FinancialInstitution,
  MembershipCreateRequest,
  MembershipResponse,
  OfferingRequest,
  OfferingResponse,
  OfferingSearchResult,
  OrganizationResponse,
  PasswordChangeRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  PaymentResponse,
  PublicOrganizationResponse,
  RequirementFileResponse,
  RescheduleRequest,
  ScheduleExceptionRequest,
  ScheduleExceptionResponse,
  SelfProfileResponse,
  SelfProfileUpdateRequest,
  TenantContactUpdateRequest,
  TenantCreateRequest,
  TenantPaymentConfigRequest,
  TenantPaymentConfigResponse,
  TenantResponse,
  TenantStatusUpdateRequest,
  TenantUpdateRequest,
  UserLockRequest,
  UserResponse,  
  UserCardResponse,
  UserUpdateRequest
} from './types';

export type PageParams = { page?: number; size?: number; sort?: string };

const pageQuery = (p: PageParams = {}) => buildQuery({ page: p.page, size: p.size, sort: p.sort });

// ---- Catálogo ----
export const catalogApi = {
  listOfferings: (p?: PageParams) => api.get<Page<OfferingResponse>>(`/catalog/offerings${pageQuery(p)}`),
  getOffering: (id: string) => api.get<OfferingResponse>(`/catalog/offerings/${id}`),
  // Detalle público (cualquier usuario autenticado) para la pantalla de reserva.
  getPublicOffering: (id: string) => api.get<OfferingResponse>(`/catalog/search/${id}`),
  createOffering: (body: OfferingRequest) => api.post<OfferingResponse>('/catalog/offerings', body),
  updateOffering: (id: string, body: OfferingRequest) => api.put<OfferingResponse>(`/catalog/offerings/${id}`, body),
  setActive: (id: string, active: boolean) => api.patch<OfferingResponse>(`/catalog/offerings/${id}/active`, { active }),
  search: (params: { q?: string; category?: string; modality?: string } & PageParams) =>
    api.get<Page<OfferingSearchResult>>(
      `/catalog/search${buildQuery({
        q: params.q,
        category: params.category,
        modality: params.modality,
        page: params.page,
        size: params.size,
        sort: params.sort
      })}`
    ),
  // Búsqueda PÚBLICA del catálogo (sin sesión): va directo al gateway (/catalog/search es permitAll),
  // no por el proxy autenticado del BFF. Sirve a la landing y a la exploración del invitado por igual.
  searchPublic: async (params: { q?: string; category?: string; modality?: string } & PageParams) => {
    const query = buildQuery({
      q: params.q,
      category: params.category,
      modality: params.modality,
      page: params.page,
      size: params.size,
      sort: params.sort
    });
    const response = await fetch(`/catalog/search${query}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new ApiError(response.status, `${response.status} ${response.statusText}`);
    }
    return (await response.json()) as Page<OfferingSearchResult>;
  }
};

// ---- Agenda: horario del tenant ----
export const schedulingApi = {
  getHours: () => api.get<BusinessHoursDto[]>('/scheduling/hours'),
  saveHours: (body: BusinessScheduleRequest) => api.put<BusinessHoursDto[]>('/scheduling/hours', body),
  listExceptions: (p?: PageParams) =>
    api.get<Page<ScheduleExceptionResponse>>(`/scheduling/exceptions${pageQuery(p)}`),
  createException: (body: ScheduleExceptionRequest) =>
    api.post<ScheduleExceptionResponse>('/scheduling/exceptions', body),
  deleteException: (id: string) => api.delete<void>(`/scheduling/exceptions/${id}`)
};

// ---- Citas: reserva y gestión del cliente (GUEST_USER) ----
export const appointmentsApi = {
  availability: (offeringId: string, date: string) =>
    api.get<AvailableSlot[]>(`/scheduling/offerings/${offeringId}/availability${buildQuery({ date })}`),
  book: (body: AppointmentBookingRequest) => api.post<AppointmentResponse>('/scheduling/appointments', body),
  // Sube un anexo de archivo antes de reservar; devuelve el fileId que se manda como valor del requisito FILE.
  uploadRequirementFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.postForm<RequirementFileResponse>('/scheduling/requirement-files', form);
  },
  // Trae el anexo (PDF) de un requisito como Blob, para visualizarlo (dueño de la cita o su establecimiento).
  requirementFileBlob: (appointmentId: string, key: string) =>
    fetchBlob(`/scheduling/appointments/${appointmentId}/requirements/${encodeURIComponent(key)}/file`),
  listMine: (p?: PageParams) => api.get<Page<AppointmentResponse>>(`/scheduling/appointments${pageQuery(p)}`),
  get: (id: string) => api.get<AppointmentResponse>(`/scheduling/appointments/${id}`),
  cancel: (id: string) => api.post<AppointmentResponse>(`/scheduling/appointments/${id}/cancel`),
  reschedule: (id: string, body: RescheduleRequest) =>
    api.post<AppointmentResponse>(`/scheduling/appointments/${id}/reschedule`, body)
};

// ---- Citas: gestión por el establecimiento (TENANT_ADMIN / TENANT_PARTNER) ----
export const tenantAppointmentsApi = {
  list: (p?: PageParams) => api.get<Page<AppointmentResponse>>(`/scheduling/me/appointments${pageQuery(p)}`),
  // Vista calendario: citas cuyo inicio cae en [from, to). 'from'/'to' son fecha-hora local sin zona
  // (LocalDateTime en backend), p. ej. "2026-06-01T00:00:00".
  listCalendar: (from: string, to: string) =>
    api.get<AppointmentResponse[]>(
      `/scheduling/me/appointments/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    ),
  get: (id: string) => api.get<AppointmentResponse>(`/scheduling/me/appointments/${id}`),
  cancel: (id: string) => api.post<AppointmentResponse>(`/scheduling/me/appointments/${id}/cancel`),
  reschedule: (id: string, body: RescheduleRequest) =>
    api.post<AppointmentResponse>(`/scheduling/me/appointments/${id}/reschedule`, body),
  // Asistencia (solo desde CONFIRMED): cerrar la cita como atendida o como no presentado.
  complete: (id: string) => api.post<AppointmentResponse>(`/scheduling/me/appointments/${id}/complete`),
  noShow: (id: string) => api.post<AppointmentResponse>(`/scheduling/me/appointments/${id}/no-show`)
};

// ---- Tenant ----
export const tenantApi = {
  getMine: () => api.get<TenantResponse>('/tenant/me'),
  updateMine: (body: TenantContactUpdateRequest) => api.put<TenantResponse>('/tenant/me', body),
  // Organizaciones a las que pertenezco (selector de tenant activo).
  listMyOrganizations: () => api.get<OrganizationResponse[]>('/tenant/me/organizations'),
  listMyMembers: (p?: PageParams) => api.get<Page<MembershipResponse>>(`/tenant/me/members${pageQuery(p)}`),
  addMyMember: (body: MembershipCreateRequest) => api.post<MembershipResponse>('/tenant/me/members', body),
  removeMyMember: (userId: string) => api.delete<void>(`/tenant/me/members/${userId}`),
  // Administración de plataforma
  listTenants: (p?: PageParams) => api.get<Page<TenantResponse>>(`/tenant/admin/tenants${pageQuery(p)}`),
  getTenant: (id: string) => api.get<TenantResponse>(`/tenant/admin/tenants/${id}`),
  createTenant: (body: TenantCreateRequest) => api.post<TenantResponse>('/tenant/admin/tenants', body),
  updateTenant: (id: string, body: TenantUpdateRequest) =>
    api.put<TenantResponse>(`/tenant/admin/tenants/${id}`, body),
  setTenantStatus: (id: string, body: TenantStatusUpdateRequest) =>
    api.patch<TenantResponse>(`/tenant/admin/tenants/${id}/status`, body),
  listTenantMembers: (tenantId: string, p?: PageParams) =>
    api.get<Page<MembershipResponse>>(`/tenant/admin/tenants/${tenantId}/members${pageQuery(p)}`),
  addTenantMember: (tenantId: string, body: MembershipCreateRequest) =>
    api.post<MembershipResponse>(`/tenant/admin/tenants/${tenantId}/members`, body),
  removeTenantMember: (tenantId: string, userId: string) =>
    api.delete<void>(`/tenant/admin/tenants/${tenantId}/members/${userId}`),
  // Datos PÚBLICOS de un establecimiento (sin sesión): va directo al gateway (/tenant/public/** es
  // permitAll), no por el BFF. Lo usa la exploración para mostrar el establecimiento y su ubicación.
  publicOrganization: async (id: string) => {
    const response = await fetch(`/tenant/public/${id}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new ApiError(response.status, `${response.status} ${response.statusText}`);
    }
    return (await response.json()) as PublicOrganizationResponse;
  }
};

// ---- Identidad ----
export const identityApi = {
  // Perfil propio del usuario autenticado (incluye teléfono para recordatorios SMS).
  getMyProfile: () => api.get<SelfProfileResponse>('/identity/me'),
  updateMyProfile: (body: SelfProfileUpdateRequest) => api.put<SelfProfileResponse>('/identity/me', body),
  // Directorio: resolver id -> nombre/correo en pantallas de citas y pagos del establecimiento
  // (TENANT_ADMIN / TENANT_PARTNER). 'resolveUsers' resuelve un lote para listados.
  getUserCard: (id: string) => api.get<UserCardResponse>(`/identity/directory/users/${id}`),
  resolveUsers: (ids: string[]) =>
    api.get<UserCardResponse[]>(`/identity/directory/users${buildQuery({ ids: ids.join(',') })}`),
  // Busca un usuario por correo (para invitar miembros sin manejar el id). 404 si no existe.
  findUserByEmail: (email: string) =>
    api.get<UserCardResponse>(`/identity/directory/users/by-email${buildQuery({ email })}`),
  // Cambio de contraseña del usuario autenticado: verifica la actual y aplica la nueva (RF-03).
  changeMyPassword: (body: PasswordChangeRequest) => api.put<void>('/identity/me/password', body),
  // Cambio de contraseña por código al correo (endpoints públicos en el gateway).
  requestPasswordReset: (body: PasswordResetRequest) =>
    api.post<void>('/identity/users/password-reset/request', body),
  confirmPasswordReset: (body: PasswordResetConfirmRequest) =>
    api.post<void>('/identity/users/password-reset/confirm', body),
  // Cambio de contraseña del usuario autenticado (exige la contraseña actual).
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.put<void>('/identity/me/password', body), 
  // El backend espera los ids separados por comas literales (no se debe codificar la coma).
  getUserCards: (ids: string[]) =>
    api.get<UserCardResponse[]>(`/identity/directory/users?ids=${ids.map(encodeURIComponent).join(',')}`),
  // Administración de plataforma (SYSTEM_ADMIN). Soporta búsqueda server-side por `q`.
  listUsers: (p: PageParams & { q?: string } = {}) =>
    api.get<Page<UserResponse>>(
      `/identity/admin/users${buildQuery({ q: p.q, page: p.page, size: p.size, sort: p.sort })}`
    ),
  getUser: (id: string) => api.get<UserResponse>(`/identity/admin/users/${id}`),
  updateUser: (id: string, body: UserUpdateRequest) => api.put<UserResponse>(`/identity/admin/users/${id}`, body),
  setLock: (id: string, body: UserLockRequest) => api.patch<UserResponse>(`/identity/admin/users/${id}/lock`, body)
};

// ---- Pagos PSE (hermes-payment-service) ----
export const paymentApi = {
  // Configuración de cobro del tenant (solo TENANT_ADMIN). Las credenciales se guardan cifradas.
  getMyConfig: () => api.get<TenantPaymentConfigResponse>('/payment/me/payment-config'),
  saveMyConfig: (body: TenantPaymentConfigRequest) =>
    api.put<TenantPaymentConfigResponse>('/payment/me/payment-config', body),
  deleteMyConfig: () => api.delete<void>('/payment/me/payment-config'),
  // Cobro de una cita por el cliente (PSE).
  banks: (appointmentId: string) =>
    api.get<FinancialInstitution[]>(`/payment/banks${buildQuery({ appointmentId })}`),
  checkout: (body: CheckoutRequest) => api.post<CheckoutResponse>('/payment/checkout', body),
  getPayment: (id: string) => api.get<PaymentResponse>(`/payment/payments/${id}`),
  listMyPayments: (p?: PageParams) => api.get<Page<PaymentResponse>>(`/payment/payments${pageQuery(p)}`),
  // Pagos recibidos por el establecimiento (solo TENANT_ADMIN).
  listReceivedPayments: (p?: PageParams) => api.get<Page<PaymentResponse>>(`/payment/me/payments${pageQuery(p)}`),
  // Cobro PAGADO de una cita de mi establecimiento (para el comprobante). 404 si no lo hay.
  getReceivedPaymentByAppointment: (appointmentId: string) =>
    api.get<PaymentResponse>(`/payment/me/payments/by-appointment/${appointmentId}`)
};

// ---- Reportes en PDF (hermes-reports) — TENANT_ADMIN / TENANT_PARTNER ----
// Las variantes *Blob traen el PDF para previsualizarlo embebido; downloadFile lo descarga directo.
export const reportsApi = {
  salesBlob: (from: string, to: string) => fetchBlob(`/reports/sales${buildQuery({ from, to })}`),
  statisticsBlob: (from: string, to: string) => fetchBlob(`/reports/statistics${buildQuery({ from, to })}`),
  // Comprobante de un pago. El backend valida la pertenencia: el dueño del pago (cliente) o su
  // establecimiento (tenant). Misma ruta para ambos; el invitado solo accede a los suyos.
  receiptBlob: (paymentId: string) => fetchBlob(`/reports/payments/${paymentId}/receipt`),
  myReceiptBlob: (paymentId: string) => fetchBlob(`/reports/payments/${paymentId}/receipt`)
};
