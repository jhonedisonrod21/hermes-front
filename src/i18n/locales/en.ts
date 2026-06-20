export const en = {
  common: {
    appName: 'Hermes Calendar',
    unavailable: 'Unavailable',
    loadingSession: 'Preparing session...',
    language: {
      label: 'Language',
      es: 'ES',
      en: 'EN'
    },
    actions: {
      logout: 'Sign out'
    },
    brand: {
      ariaLabel: 'Hermes Calendar'
    }
  },
  auth: {
    login: {
      ariaLabel: 'Login form',
      title: 'Sign in',
      username: 'User',
      password: 'Password',
      usernamePlaceholder: 'admin@hermes.local',
      passwordPlaceholder: 'admin123',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      submit: 'Sign in'
    },
    callback: {
      rejectedTitle: 'Callback rejected',
      validatingTitle: 'Validating session',
      exchangingCode: 'Exchanging authorization code for Hermes tokens.',
      genericError: 'Unable to complete sign in.'
    },
    errors: {
      missingCallbackParams: 'The authentication callback did not include code/state.',
      invalidState: 'The OAuth state does not match. Try signing in again.',
      tokenRequestFailed: 'Unable to obtain tokens',
      sessionLoginFailed: 'Unable to create the authentication session',
      sessionLoadFailed: 'Unable to load the session',
      invalidFrontendOrigin:
        'The app is open on {{currentOrigin}}, but the configured OAuth redirect uses {{expectedOrigin}}. Open the app on {{expectedOrigin}}.',
      authProviderRequired: 'useAuth must be used within AuthProvider.'
    }
  },
  dashboard: {
    nav: {
      ariaLabel: 'Main navigation',
      searchAriaLabel: 'Search Hermes',
      searchPlaceholder: 'Search appointments, patients, or resources'
    },
    userMenu: {
      profile: 'User profile'
    },
    hero: {
      sessionActive: 'Active session',
      title: 'Hermes Panel',
      description: 'Authentication is complete. This space is ready to connect scheduling, catalog, and administration.'
    },
    fallback: {
      user: 'Hermes user',
      tenant: 'Local tenant'
    },
    metrics: {
      todayAppointments: 'Appointments today',
      activeResources: 'Active resources',
      roles: 'Roles',
      permissions: 'Permissions'
    },
    authState: {
      title: 'Authentication status',
      user: 'User',
      tenant: 'Tenant',
      subject: 'Subject'
    },
    claims: {
      title: 'Claims'
    },
    footer: {
      platform: 'Hermes Calendar Platform',
      oauthLocal: 'Local OAuth2/OIDC'
    }
  }
};
