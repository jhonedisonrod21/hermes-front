import { api, buildQuery, type Page } from './http';
import type {
  BusinessHoursDto,
  BusinessScheduleRequest,
  MembershipCreateRequest,
  MembershipResponse,
  OfferingRequest,
  OfferingResponse,
  OfferingSearchResult,
  ScheduleExceptionRequest,
  ScheduleExceptionResponse,
  TenantContactUpdateRequest,
  TenantCreateRequest,
  TenantResponse,
  TenantStatusUpdateRequest,
  TenantUpdateRequest,
  UserLockRequest,
  UserResponse,
  UserUpdateRequest
} from './types';

export type PageParams = { page?: number; size?: number; sort?: string };

const pageQuery = (p: PageParams = {}) => buildQuery({ page: p.page, size: p.size, sort: p.sort });

// ---- Catálogo ----
export const catalogApi = {
  listOfferings: (p?: PageParams) => api.get<Page<OfferingResponse>>(`/catalog/offerings${pageQuery(p)}`),
  getOffering: (id: string) => api.get<OfferingResponse>(`/catalog/offerings/${id}`),
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
    )
};

// ---- Agenda ----
export const schedulingApi = {
  getHours: () => api.get<BusinessHoursDto[]>('/scheduling/hours'),
  saveHours: (body: BusinessScheduleRequest) => api.put<BusinessHoursDto[]>('/scheduling/hours', body),
  listExceptions: (p?: PageParams) =>
    api.get<Page<ScheduleExceptionResponse>>(`/scheduling/exceptions${pageQuery(p)}`),
  createException: (body: ScheduleExceptionRequest) =>
    api.post<ScheduleExceptionResponse>('/scheduling/exceptions', body),
  deleteException: (id: string) => api.delete<void>(`/scheduling/exceptions/${id}`)
};

// ---- Tenant ----
export const tenantApi = {
  getMine: () => api.get<TenantResponse>('/tenant/me'),
  updateMine: (body: TenantContactUpdateRequest) => api.put<TenantResponse>('/tenant/me', body),
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
    api.delete<void>(`/tenant/admin/tenants/${tenantId}/members/${userId}`)
};

// ---- Identidad ----
export const identityApi = {
  listUsers: (p?: PageParams) => api.get<Page<UserResponse>>(`/identity/admin/users${pageQuery(p)}`),
  getUser: (id: string) => api.get<UserResponse>(`/identity/admin/users/${id}`),
  updateUser: (id: string, body: UserUpdateRequest) => api.put<UserResponse>(`/identity/admin/users/${id}`, body),
  setLock: (id: string, body: UserLockRequest) => api.patch<UserResponse>(`/identity/admin/users/${id}/lock`, body)
};
