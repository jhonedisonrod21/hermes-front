export const es = {
  common: {
    appName: 'Hermes Calendar',
    unavailable: 'No disponible',
    loadingSession: 'Preparando sesion...',
    language: {
      label: 'Idioma',
      es: 'ES',
      en: 'EN'
    },
    actions: {
      logout: 'Salir'
    },
    brand: {
      ariaLabel: 'Hermes Calendar'
    }
  },
  auth: {
    login: {
      ariaLabel: 'Formulario de inicio de sesion',
      title: 'Iniciar sesion',
      username: 'Usuario',
      password: 'Contraseña',
      usernamePlaceholder: 'admin@hermes.local',
      passwordPlaceholder: 'admin123',
      showPassword: 'Mostrar password',
      hidePassword: 'Ocultar password',
      submit: 'Iniciar sesion',
      submitting: 'Iniciando sesion...'
    },
    callback: {
      rejectedTitle: 'Callback rechazado',
      validatingTitle: 'Validando sesion',
      exchangingCode: 'Intercambiando authorization code por tokens Hermes.',
      genericError: 'No fue posible completar el inicio de sesion.'
    },
    errors: {
      missingCallbackParams: 'El callback de autenticacion no incluyo code/state.',
      invalidState: 'El state OAuth no coincide. Intenta iniciar sesion de nuevo.',
      tokenRequestFailed: 'No fue posible obtener tokens',
      sessionLoginFailed: 'No fue posible crear la sesion de autenticacion',
      sessionLoadFailed: 'No fue posible consultar la sesion',
      invalidFrontendOrigin:
        'La app esta abierta en {{currentOrigin}}, pero el redirect OAuth configurado usa {{expectedOrigin}}. Abre la app en {{expectedOrigin}}.',
      authProviderRequired: 'useAuth debe usarse dentro de AuthProvider.'
    }
  },
  dashboard: {
    nav: {
      ariaLabel: 'Navegacion principal',
      searchAriaLabel: 'Buscar en Hermes',
      searchPlaceholder: 'Buscar citas, pacientes o recursos'
    },
    userMenu: {
      profile: 'Perfil de usuario'
    },
    hero: {
      sessionActive: 'Sesion activa',
      title: 'Panel Hermes',
      description: 'Autenticacion completada. Este espacio queda listo para conectar agenda, catalogo y administracion.'
    },
    fallback: {
      user: 'Usuario Hermes',
      tenant: 'Tenant local',
      systemAdmin: 'Administracion del sistema',
      guest: 'Invitado'
    },
    scope: {
      platform: 'Plataforma',
      tenant: 'Organizacion',
      guest: 'Invitado'
    },
    metrics: {
      todayAppointments: 'Citas de hoy',
      activeResources: 'Recursos activos',
      roles: 'Roles',
      permissions: 'Permisos'
    },
    authState: {
      title: 'Estado de autenticacion',
      user: 'Usuario',
      scope: 'Alcance',
      tenant: 'Tenant',
      workspace: 'Espacio de trabajo',
      subject: 'Subject'
    },
    claims: {
      title: 'Claims'
    },
    footer: {
      platform: 'Hermes Calendar Platform',
      oauthLocal: 'OAuth2/OIDC local'
    }
  }
};
