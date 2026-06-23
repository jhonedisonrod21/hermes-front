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
      logout: 'Salir',
      save: 'Guardar',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      edit: 'Editar',
      delete: 'Eliminar',
      close: 'Cerrar',
      label: 'Acciones'
    },
    search: {
      placeholder: 'Buscar...'
    },
    pagination: {
      page: 'Página {{current}} de {{total}}',
      items: '{{count}} resultados',
      previous: 'Anterior',
      next: 'Siguiente'
    },
    feedback: {
      created: 'Creado correctamente.',
      updated: 'Cambios guardados.',
      deleted: 'Eliminado correctamente.',
      error: 'No se pudo completar la acción.'
    },
    validation: {
      required: 'Este campo es obligatorio.',
      maxLength: 'Máximo {{max}} caracteres.',
      country: 'Selecciona un país (código ISO de 2 letras).',
      fix: 'Revisa los campos marcados.'
    },
    units: {
      hour: 'h',
      minute: 'min'
    },
    days: {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo'
    },
    dataState: {
      loading: 'Cargando...',
      error: 'No se pudo cargar la información.',
      empty: 'No hay datos para mostrar.',
      retry: 'Reintentar'
    },
    placeholder: {
      pending: 'Módulo pendiente',
      title: 'En construcción',
      service: 'Requiere el microservicio',
      planned: 'Capacidades previstas:'
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
    register: {
      title: 'Crear cuenta',
      email: 'Correo',
      emailPlaceholder: 'tu@correo.com',
      password: 'Contraseña',
      passwordHint: 'Mínimo {{min}} caracteres.',
      confirm: 'Confirmar contraseña',
      submit: 'Crear cuenta',
      submitting: 'Creando cuenta...',
      prompt: '¿No tienes cuenta?',
      switchToRegister: 'Regístrate',
      haveAccount: '¿Ya tienes cuenta?',
      switchToLogin: 'Inicia sesión',
      errors: {
        emailTaken: 'Ese correo ya está registrado.',
        passwordTooShort: 'La contraseña debe tener al menos {{min}} caracteres.',
        passwordMismatch: 'Las contraseñas no coinciden.',
        failed: 'No fue posible crear la cuenta.'
      }
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
  },
  app: {
    nav: {
      ariaLabel: 'Navegación principal',
      toggle: 'Alternar menú',
      pendingHint: 'Módulo pendiente del backend',
      overview: 'Resumen',
      catalog: 'Catálogo',
      schedule: 'Agenda',
      reports: 'Reportes',
      appointments: 'Citas',
      bookings: 'Mis reservas',
      team: 'Equipo',
      organization: 'Organización',
      tenants: 'Organizaciones',
      users: 'Usuarios',
      explore: 'Explorar'
    },
    roles: {
      'system-admin': 'Administrador del sistema',
      'tenant-admin': 'Administrador de organización',
      'tenant-partner': 'Colaborador',
      guest: 'Invitado'
    }
  },
  overview: {
    eyebrow: 'Panel',
    greeting: 'Hola, {{name}}',
    sessionActive: 'Sesión activa',
    quickLinks: 'Accesos rápidos',
    fallback: {
      user: 'Usuario Hermes',
      tenant: 'Tu organización',
      systemAdmin: 'Administración del sistema',
      guest: 'Invitado'
    },
    intro: {
      'system-admin': 'Gestiona organizaciones y usuarios de toda la plataforma Hermes.',
      'tenant-admin': 'Administra tu catálogo de servicios, tu agenda y tu equipo.',
      'tenant-partner': 'Opera la agenda: crea y gestiona las citas de la organización.',
      guest: 'Explora los servicios disponibles y encuentra dónde reservar.'
    },
    tenant: {
      offerings: 'Servicios',
      activeOfferings: 'Servicios activos',
      members: 'Miembros del equipo'
    },
    admin: {
      tenants: 'Organizaciones',
      users: 'Usuarios'
    },
    links: {
      catalog: 'Ir al catálogo',
      schedule: 'Ver agenda',
      team: 'Gestionar equipo',
      tenants: 'Gestionar organizaciones',
      users: 'Gestionar usuarios',
      explore: 'Explorar servicios',
      appointments: 'Gestionar citas',
      bookings: 'Mis reservas'
    }
  },
  catalog: {
    eyebrow: 'Catálogo',
    title: 'Servicios',
    description: 'Define los servicios que tu organización ofrece para reservar.',
    empty: 'Aún no has creado servicios. Crea el primero.',
    searchPlaceholder: 'Buscar por nombre o categoría...',
    actions: {
      new: 'Nuevo servicio',
      activate: 'Activar',
      deactivate: 'Desactivar'
    },
    status: {
      active: 'Activo',
      inactive: 'Inactivo'
    },
    badges: {
      onlinePayment: 'Pago online',
      requirements: '{{count}} requisitos'
    },
    toast: {
      activated: 'Servicio activado.',
      deactivated: 'Servicio desactivado.'
    },
    confirm: {
      deactivateTitle: 'Desactivar servicio',
      deactivateMessage: '¿Desactivar "{{name}}"? Dejará de estar visible para reservar.'
    },
    requirements: {
      title: 'Requisitos / anexos',
      add: 'Agregar requisito',
      empty: 'Sin requisitos. Agrega los datos o anexos que pedirás al reservar.',
      label: 'Etiqueta',
      type: 'Tipo',
      required: 'Obligatorio',
      types: {
        TEXT: 'Texto',
        NUMBER: 'Número',
        DATE: 'Fecha',
        BOOLEAN: 'Sí / No',
        FILE: 'Archivo'
      }
    },
    fields: {
      name: 'Nombre',
      category: 'Categoría',
      modality: 'Modalidad',
      duration: 'Duración (min)',
      price: 'Precio',
      currency: 'Moneda',
      description: 'Descripción',
      status: 'Estado',
      requiresOnlinePayment: 'Requiere pago online por adelantado'
    },
    modality: {
      IN_PERSON: 'Presencial',
      VIRTUAL: 'Virtual',
      BOTH: 'Mixto'
    },
    form: {
      createTitle: 'Nuevo servicio',
      editTitle: 'Editar servicio'
    }
  },
  schedule: {
    eyebrow: 'Agenda',
    title: 'Horarios de atención',
    description: 'Configura el horario semanal y las excepciones (cierres o jornadas especiales).',
    hours: {
      title: 'Horario semanal',
      save: 'Guardar horario'
    },
    exceptions: {
      title: 'Excepciones',
      add: 'Agregar excepción',
      empty: 'No hay excepciones registradas.',
      date: 'Fecha',
      type: 'Tipo',
      closed: 'Cerrado',
      customHours: 'Horario especial',
      opensAt: 'Abre',
      closesAt: 'Cierra',
      description: 'Descripción'
    },
    toast: {
      hoursSaved: 'Horario guardado.',
      exceptionAdded: 'Excepción agregada.'
    },
    confirm: {
      deleteExceptionTitle: 'Eliminar excepción',
      deleteExceptionMessage: '¿Eliminar esta excepción del calendario?'
    }
  },
  team: {
    eyebrow: 'Equipo',
    title: 'Miembros de la organización',
    description: 'Agrega o quita miembros y define su rol dentro de la organización.',
    empty: 'Todavía no hay miembros además de ti.',
    searchPlaceholder: 'Buscar por ID o rol...',
    actions: {
      add: 'Agregar miembro'
    },
    toast: {
      added: 'Miembro agregado.'
    },
    confirm: {
      removeTitle: 'Quitar miembro',
      removeMessage: '¿Quitar al usuario {{id}} de la organización?'
    },
    fields: {
      userId: 'ID de usuario',
      userIdHint: 'Identificador del usuario en Hermes (UUID).',
      role: 'Rol',
      roles: 'Roles',
      status: 'Estado',
      since: 'Desde'
    },
    roles: {
      TENANT_ADMIN: 'Administrador',
      TENANT_STAFF: 'Personal'
    }
  },
  organization: {
    eyebrow: 'Organización',
    title: 'Perfil de la organización',
    description: 'Actualiza los datos de contacto de tu organización.',
    saved: 'Cambios guardados',
    readonlyNote: 'El nombre, país y ciudad solo los puede cambiar un administrador del sistema.',
    fields: {
      name: 'Nombre',
      taxId: 'Identificación fiscal',
      country: 'País',
      countryPlaceholder: 'Selecciona un país',
      city: 'Ciudad',
      address: 'Dirección',
      description: 'Descripción'
    }
  },
  admin: {
    tenants: {
      eyebrow: 'Administración',
      title: 'Organizaciones',
      description: 'Gestiona las organizaciones registradas en la plataforma.',
      empty: 'No hay organizaciones registradas.',
      searchPlaceholder: 'Buscar por nombre, slug o ciudad...',
      name: 'Nombre',
      slug: 'Slug',
      location: 'Ubicación',
      status: 'Estado',
      created: 'Creada',
      suspend: 'Suspender',
      activate: 'Activar',
      new: 'Nueva organización',
      create: 'Crear organización',
      createTitle: 'Nueva organización',
      editTitle: 'Editar organización',
      members: 'Miembros',
      confirm: {
        suspendTitle: 'Suspender organización',
        suspendMessage: '¿Suspender "{{name}}"? Sus miembros perderán acceso a la operación.'
      }
    },
    members: {
      title: 'Miembros de {{name}}',
      pickUser: 'Usuario',
      pickPlaceholder: 'Buscar por usuario o correo...',
      pickHint: 'Selecciona un usuario registrado. Como TENANT_ADMIN administrará la organización.',
      searchEmpty: 'No hay usuarios disponibles para agregar.',
      clear: 'Quitar selección',
      empty: 'Esta organización aún no tiene miembros.',
      roles: {
        TENANT_ADMIN: 'Administrador',
        TENANT_PARTNER: 'Colaborador'
      }
    },
    users: {
      eyebrow: 'Administración',
      title: 'Usuarios',
      description: 'Consulta y administra las cuentas de usuario.',
      empty: 'No hay usuarios registrados.',
      searchPlaceholder: 'Buscar por usuario o correo...',
      editTitle: 'Editar usuario',
      username: 'Usuario',
      email: 'Correo',
      roles: 'Roles',
      status: 'Estado',
      created: 'Creado',
      active: 'Activo',
      disabled: 'Deshabilitado',
      locked: 'Bloqueado',
      lock: 'Bloquear',
      unlock: 'Desbloquear',
      toast: {
        locked: 'Usuario bloqueado.',
        unlocked: 'Usuario desbloqueado.'
      },
      confirm: {
        lockTitle: 'Bloquear usuario',
        lockMessage: '¿Bloquear a "{{name}}"? No podrá iniciar sesión hasta desbloquearlo.'
      }
    }
  },
  explore: {
    eyebrow: 'Explorar',
    title: 'Encuentra servicios',
    description: 'Busca servicios disponibles en las organizaciones de Hermes.',
    search: 'Buscar',
    anyModality: 'Cualquier modalidad',
    noResults: 'No se encontraron servicios para tu búsqueda.',
    fields: {
      query: 'Búsqueda',
      queryPlaceholder: 'Ej. consulta, asesoría, corte...'
    }
  },
  appointments: {
    eyebrow: 'Operación',
    title: 'Citas',
    description: 'Crea y gestiona las citas, reservaciones y su ciclo de estados.',
    capabilities: {
      create: 'Crear citas / reservaciones',
      reschedule: 'Reprogramar una cita',
      cancel: 'Eliminar o cancelar una cita',
      markStates: 'Marcar estados: completada, no atendida, pagada, finalizada, cancelada'
    }
  },
  reports: {
    eyebrow: 'Análisis',
    title: 'Reportes',
    description: 'Genera y visualiza reportes de la operación de tu organización.',
    capabilities: {
      appointments: 'Reportes de citas por estado y periodo',
      revenue: 'Ingresos, pagos y copagos',
      occupancy: 'Ocupación y rendimiento de servicios'
    }
  },
  bookings: {
    eyebrow: 'Mis reservas',
    title: 'Reservas y pagos',
    description: 'Reserva un horario de cita y efectúa el pago de los servicios.',
    capabilities: {
      book: 'Reservar un horario de cita',
      pay: 'Efectuar un pago',
      history: 'Historial de reservas y comprobantes'
    }
  },
  account: {
    eyebrow: 'Cuenta',
    title: 'Mi cuenta',
    description: 'Tus datos de acceso y de sesión en Hermes.',
    guestHint: 'Aún no perteneces a ninguna organización. Comparte tu ID de usuario con un administrador para que te asocie.',
    workspace: 'Organización',
    profile: {
      title: 'Perfil',
      email: 'Correo',
      role: 'Rol',
      userId: 'ID de usuario',
      copy: 'Copiar',
      copied: 'Copiado'
    },
    password: {
      title: 'Cambiar contraseña',
      pending: 'El cambio de contraseña estará disponible cuando el servicio de identidad lo exponga.'
    }
  },
  landing: {
    nav: {
      signIn: 'Iniciar sesión',
      getStarted: 'Crear cuenta'
    },
    hero: {
      eyebrow: 'Reservas · Agenda · Pagos',
      titleLead: 'Tu negocio,',
      titleKey: 'coordinado',
      titleTail: 'al minuto.',
      lede: 'Hermes reúne tu catálogo de servicios, tu agenda y tus pagos en una sola plataforma. Tú pones la hora; nosotros la cumplimos.',
      primary: 'Crear cuenta',
      secondary: 'Iniciar sesión',
      coords: '04.711°N · 74.072°W · HORA LOCAL',
      readout: 'Reservada'
    },
    pillars: {
      eyebrow: 'Una plataforma',
      title: 'Todo lo que mueve tu agenda',
      catalog: {
        tag: 'catálogo',
        title: 'Tus servicios, claros',
        body: 'Publica servicios con precio, duración y los requisitos que pedirás al reservar. Actívalos o vuélvelos invisibles cuando quieras.'
      },
      schedule: {
        tag: 'agenda',
        title: 'Tus horas, tus reglas',
        body: 'Define el horario semanal y los feriados. Hermes respeta cada cierre y cada jornada especial.'
      },
      team: {
        tag: 'equipo',
        title: 'Cada quien, su rol',
        body: 'Suma administradores y colaboradores. Cada persona ve y hace exactamente lo que le toca.'
      }
    },
    lifecycle: {
      eyebrow: 'El ciclo de una cita',
      title: 'De la reserva al cobro, sin perder el hilo',
      reserved: { name: 'Reservada', note: 'El cliente elige hora y deja sus datos.' },
      paid: { name: 'Pagada', note: 'Cobro o copago confirmado por adelantado.' },
      attended: { name: 'Atendida', note: 'La cita ocurre y tu equipo la marca.' },
      completed: { name: 'Completada', note: 'Cerrada y lista para el reporte.' },
      foot: 'También: No atendida · Cancelada · Finalizada'
    },
    roles: {
      eyebrow: 'Cuatro roles',
      title: 'Una coordinación para cada actor',
      admin: {
        title: 'Administrador del sistema',
        body: 'Da de alta organizaciones y usuarios en toda la plataforma.'
      },
      tenantAdmin: {
        title: 'Administrador de organización',
        body: 'Gestiona el catálogo, la agenda y el equipo de su negocio.'
      },
      partner: {
        title: 'Colaborador',
        body: 'Opera la agenda: crea, cambia y cierra las citas del día.'
      },
      guest: {
        title: 'Invitado',
        body: 'Busca servicios, reserva una hora y paga en línea.'
      }
    },
    final: {
      title: 'Pon tu agenda en hora',
      lede: 'Crea tu cuenta y empieza a coordinar reservas hoy mismo.',
      cta: 'Crear cuenta'
    },
    footer: {
      left: 'Hermes Calendar — Plataforma de reservas',
      right: 'OAuth2/OIDC · Microservicios'
    }
  }
};
