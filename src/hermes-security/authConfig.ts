export const authConfig = {
  authBaseUrl: import.meta.env.VITE_HERMES_AUTH_BASE_URL ?? '/auth',
  bffBaseUrl: import.meta.env.VITE_HERMES_BFF_BASE_URL ?? '/bff',
  apiBaseUrl: import.meta.env.VITE_HERMES_API_BASE_URL ?? '/bff/api',
  bffClientRegistrationId:
    import.meta.env.VITE_HERMES_BFF_CLIENT_REGISTRATION_ID ?? 'hermes-web-client'
};

export const oauthEndpoints = {
  sessionLogin: `${authConfig.authBaseUrl}/session/login`,
  bffLogin: `${authConfig.bffBaseUrl}/oauth2/authorization/${authConfig.bffClientRegistrationId}`,
  bffSession: `${authConfig.bffBaseUrl}/session/me`,
  bffLogout: `${authConfig.bffBaseUrl}/session/logout`
};
