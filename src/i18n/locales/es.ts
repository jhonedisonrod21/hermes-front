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
      payments: 'Pagos',
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
    },
    orgSwitcher: {
      label: 'Organización activa'
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
    guest: {
      next: 'Tu próxima cita',
      service: 'Tu servicio',
      viewBooking: 'Ver mis reservas',
      payNow: 'Pagar ahora',
      noNext: 'Aún no tienes citas',
      noNextHint: 'Explora los servicios disponibles y reserva tu primera cita.',
      exploreCta: 'Explorar servicios',
      upcoming: 'Próximas citas',
      pendingPayment: 'Pendientes de pago'
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
    allStatus: 'Todos los estados',
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
    hints: {
      name: 'Nombre del servicio tal como lo verán tus clientes.',
      category: 'Agrupa servicios similares (p. ej. Consultas, Vacunas).',
      modality: 'Cómo se presta: presencial, virtual o ambos.',
      duration: 'Cuánto dura cada cita, en minutos.',
      price: 'Precio por cita. Usa 0 si es gratuito.',
      currency: 'Moneda en la que cobras este servicio.',
      description: 'Detalles que ayuden al cliente a decidir.'
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
      dateHint: 'Día concreto que será una excepción a tu horario habitual.',
      type: 'Tipo',
      typeHint: 'Cerrado todo el día u horario especial solo ese día.',
      closed: 'Cerrado',
      customHours: 'Horario especial',
      opensAt: 'Abre',
      closesAt: 'Cierra',
      description: 'Descripción',
      descriptionHint: 'Motivo de la excepción (opcional), p. ej. Festivo.'
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
    allRoles: 'Todos los roles',
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
      userIdHint: 'UUID del usuario. Cada persona encuentra el suyo en su pantalla "Cuenta".',
      role: 'Rol',
      roleHint: 'Admin gestiona toda la organización; Profesional solo atiende sus citas.',
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
    },
    hints: {
      name: 'Nombre comercial de la organización.',
      taxId: 'Identificación tributaria (p. ej. NIT o RUT), sin puntos.',
      country: 'País donde está registrada la organización.',
      city: 'Ciudad principal donde operas.',
      address: 'Dirección física donde atiendes a tus clientes.',
      description: 'Breve descripción que verán tus clientes.'
    }
  },
  admin: {
    tenants: {
      eyebrow: 'Administración',
      title: 'Organizaciones',
      description: 'Gestiona las organizaciones registradas en la plataforma.',
      empty: 'No hay organizaciones registradas.',
      searchPlaceholder: 'Buscar por nombre, slug o ciudad...',
      allStatus: 'Todos los estados',
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
      filterRole: 'Filtrar por rol',
      allRoles: 'Todos los roles',
      hideLocked: 'Ocultar bloqueados',
      matches: '{{count}} disponibles',
      assignRole: 'Rol en la organización',
      assignRoleHint: 'Administrador gestiona la organización; Profesional atiende citas.',
      empty: 'Aún no hay miembros. Busca un usuario arriba y agrégalo.',
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
      allRoles: 'Todos los roles',
      allStatus: 'Todos los estados',
      editTitle: 'Editar usuario',
      username: 'Usuario',
      usernameHint: 'Nombre con el que el usuario inicia sesión.',
      email: 'Correo',
      emailHint: 'Correo de contacto del usuario.',
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
    eyebrow: 'Reserva en minutos',
    title: 'Encuentra servicios',
    heroTitle: 'Reserva tu próxima cita',
    heroSubtitle: 'Explora servicios de las organizaciones de Hermes y reserva tu horario en segundos.',
    description: 'Busca servicios disponibles en las organizaciones de Hermes.',
    search: 'Buscar',
    book: 'Reservar ahora',
    onlinePayment: 'Pago en línea',
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
    listDescription: 'Gestiona las citas de tu organización: cancela o reprograma según el estado.',
    searchPlaceholder: 'Buscar por servicio o cliente...',
    allStatus: 'Todos los estados',
    empty: 'Aún no hay citas registradas.',
    columns: {
      service: 'Servicio',
      customer: 'Cliente',
      start: 'Inicio',
      status: 'Estado',
      price: 'Precio'
    },
    status: {
      PENDING_PAYMENT: 'Pendiente de pago',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      NO_SHOW: 'No atendida',
      EXPIRED: 'Expirada'
    },
    actions: {
      cancel: 'Cancelar',
      reschedule: 'Reprogramar'
    },
    confirm: {
      cancelTitle: 'Cancelar cita',
      cancelMessage: '¿Seguro que quieres cancelar esta cita?'
    },
    toast: {
      cancelled: 'Cita cancelada.',
      rescheduled: 'Cita reprogramada.'
    },
    reschedule: {
      title: 'Reprogramar: {{service}}',
      date: 'Nueva fecha',
      dateHint: 'Elige una nueva fecha y selecciona un horario disponible.',
      slots: 'Horarios disponibles',
      noSlots: 'No hay horarios disponibles ese día. Prueba otra fecha.',
      pickSlot: 'Elige un horario disponible.',
      conflict: 'Ese horario ya no está disponible. Elige otro.',
      submit: 'Reprogramar'
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
    eyebrow: 'Reservas',
    title: 'Mis reservas',
    listDescription: 'Tus citas reservadas. Puedes reprogramarlas o cancelarlas mientras estén activas.',
    explore: 'Explorar servicios',
    empty: 'Aún no tienes reservas. Explora los servicios y reserva tu primera cita.',
    sections: {
      upcoming: 'Próximas',
      past: 'Historial'
    },
    loadMore: 'Cargar más ({{count}})',
    confirm: {
      cancelTitle: 'Cancelar reserva',
      cancelMessage: '¿Seguro que quieres cancelar esta reserva?'
    },
    book: {
      title: 'Reservar: {{service}}',
      date: 'Fecha',
      dateHint: 'Elige el día de tu cita y verás los horarios disponibles.',
      slots: 'Horarios disponibles',
      noSlots: 'No hay horarios disponibles ese día. Prueba otra fecha.',
      pickSlot: 'Elige un horario disponible.',
      requirements: 'Datos requeridos',
      fillRequired: 'Completa los datos obligatorios.',
      typeHint: {
        NUMBER: 'Ingresa solo números.',
        DATE: 'Selecciona una fecha.',
        FILE: 'Adjunta el archivo solicitado.'
      },
      paymentNote: 'requiere pago en línea',
      confirm: 'Confirmar reserva',
      booking: 'Reservando...',
      booked: 'Reserva creada. Revísala en "Mis reservas".'
    },
    pay: {
      action: 'Pagar',
      title: 'Pagar: {{service}}',
      bank: 'Banco (PSE)',
      bankHint: 'Elige el banco desde el que harás la transferencia PSE.',
      pickBank: 'Selecciona tu banco',
      legalType: 'Tipo de persona',
      legal: { NATURAL: 'Natural', JURIDICAL: 'Jurídica' },
      documentType: 'Tipo de documento',
      documentNumber: 'Número de documento',
      documentNumberHint: 'Solo números, sin puntos ni guiones.',
      fullName: 'Nombre completo',
      fullNameHint: 'Tal como aparece en tu documento de identidad.',
      email: 'Correo',
      emailHint: 'Te enviaremos aquí el comprobante del pago.',
      phone: 'Teléfono',
      phoneHint: 'Número de contacto por si hay alguna novedad con el pago.',
      submit: 'Ir a pagar',
      processing: 'Redirigiendo...',
      unavailable: 'El servicio de pago no está disponible ahora. Inténtalo de nuevo en unos minutos.'
    },
    return: {
      title: 'Pago en proceso',
      message: 'Estamos confirmando tu pago. El estado de tu reserva se actualizará en cuanto lo recibamos.',
      failedTitle: 'El pago no se completó',
      failedMessage: 'No se pudo procesar el pago. Puedes intentarlo de nuevo desde tu reserva.',
      action: 'Ver mis reservas'
    }
  },
  account: {
    eyebrow: 'Cuenta',
    title: 'Mi cuenta',
    description: 'Tus datos de acceso y de sesión en Hermes.',
    guest: {
      clientNote: 'Estás usando Hermes como cliente: reserva y gestiona tus citas. No necesitas configurar nada más.',
      staffQuestion: '¿Trabajas en un negocio que usa Hermes?',
      staffHint: 'Comparte tu ID de usuario (arriba) con el administrador del negocio para que te asocie y puedas gestionar su agenda.'
    },
    workspace: 'Organización',
    profile: {
      title: 'Perfil',
      email: 'Correo',
      role: 'Rol',
      userId: 'ID de usuario',
      copy: 'Copiar',
      copied: 'Copiado',
      phone: 'Teléfono',
      phoneHint: 'Lo usamos para enviarte recordatorios de tus citas por SMS.',
      saved: 'Teléfono actualizado.'
    },
    password: {
      title: 'Cambiar contraseña',
      intro: 'Te enviamos un código a tu correo; úsalo abajo para definir una nueva contraseña.',
      request: 'Enviar código a mi correo',
      sending: 'Enviando...',
      resend: 'Reenviar código',
      requestSent: 'Código enviado. Revisa tu correo.',
      token: 'Código',
      tokenHint: 'El código que llegó a tu correo.',
      newPassword: 'Nueva contraseña',
      newPasswordHint: 'Mínimo 8 caracteres.',
      confirmPassword: 'Confirmar contraseña',
      confirmPasswordHint: 'Repite la misma contraseña para confirmar.',
      submit: 'Cambiar contraseña',
      changed: 'Contraseña actualizada.',
      mismatch: 'Las contraseñas no coinciden.',
      tooShort: 'La contraseña debe tener al menos {{min}} caracteres.'
    }
  },
  payments: {
    eyebrow: 'Cobros',
    title: 'Configuración de pagos',
    description: 'Conecta tu pasarela PSE para cobrar las reservas de tus servicios.',
    notConfigured: 'Sin configurar',
    active: 'Cobros activos',
    inactive: 'Cobros inactivos',
    configured: 'Ya configurada',
    secretHint: 'Solo se guarda; no se vuelve a mostrar. Déjalo vacío para no cambiarla.',
    updatedAt: 'Actualizada el {{date}}',
    saved: 'Configuración guardada.',
    delete: 'Eliminar configuración',
    deleted: 'Configuración eliminada.',
    deleteConfirm: {
      title: 'Eliminar configuración de pagos',
      message: '¿Eliminar la configuración? Dejarás de poder cobrar en línea.'
    },
    fields: {
      provider: 'Pasarela',
      enabled: 'Activar cobros en línea',
      merchantAccount: 'Cuenta de comercio',
      publicKey: 'Llave pública',
      privateKey: 'Llave privada',
      eventsSecret: 'Secreto de eventos'
    },
    hints: {
      provider: 'Pasarela que procesará los pagos en línea.',
      merchantAccount: 'Identificador de tu comercio en la pasarela.',
      publicKey: 'Clave pública que te entrega la pasarela.'
    },
    providers: {
      FAKE_PSE: 'PSE de prueba',
      WOMPI: 'Wompi',
      PAYU: 'PayU'
    },
    received: {
      title: 'Cobros recibidos'
    },
    history: {
      title: 'Historial de pagos',
      empty: 'Aún no hay pagos registrados.',
      date: 'Fecha',
      amount: 'Monto',
      status: 'Estado',
      appointment: 'Cita',
      resume: 'Continuar pago',
      statuses: {
        PENDING: 'Pendiente',
        PAID: 'Pagado',
        FAILED: 'Fallido',
        EXPIRED: 'Expirado',
        CANCELLED: 'Cancelado'
      }
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
