export const authConfig = {
  authBaseUrl: import.meta.env.VITE_HERMES_AUTH_BASE_URL ?? '/auth',
  bffBaseUrl: import.meta.env.VITE_HERMES_BFF_BASE_URL ?? '/bff',
  apiBaseUrl: import.meta.env.VITE_HERMES_API_BASE_URL ?? '/bff/api',
  // El registro es publico y va directo al gateway (no por el proxy autenticado del BFF).
  identityBaseUrl: import.meta.env.VITE_HERMES_IDENTITY_BASE_URL ?? '/identity',
  bffClientRegistrationId:
    import.meta.env.VITE_HERMES_BFF_CLIENT_REGISTRATION_ID ?? 'hermes-web-client'
};

export const oauthEndpoints = {
  sessionLogin: `${authConfig.authBaseUrl}/session/login`,
  bffLogin: `${authConfig.bffBaseUrl}/oauth2/authorization/${authConfig.bffClientRegistrationId}`,
  bffSession: `${authConfig.bffBaseUrl}/session/me`,
  bffSwitchTenant: `${authConfig.bffBaseUrl}/session/switch-tenant`,
  bffLogout: `${authConfig.bffBaseUrl}/session/logout`,
  register: `${authConfig.identityBaseUrl}/users/register`,
  // Restablecimiento de contraseña: público (usuario sin sesión), va directo al gateway (no por el BFF).
  passwordResetRequest: `${authConfig.identityBaseUrl}/users/password-reset/request`,
  passwordResetConfirm: `${authConfig.identityBaseUrl}/users/password-reset/confirm`
};
