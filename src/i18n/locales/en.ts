export const en = {
  common: {
    appName: 'Hermes Calendar',
    unavailable: 'Unavailable',
    loadingSession: 'Preparing session...',
    roleNames: {
      SYSTEM_ADMIN: 'System administrator',
      TENANT_ADMIN: 'Administrator',
      TENANT_PARTNER: 'Professional',
      TENANT_STAFF: 'Staff',
      GUEST_USER: 'Client'
    },
    statusValues: {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      SUSPENDED: 'Suspended',
      PENDING: 'Pending'
    },
    language: {
      label: 'Language',
      es: 'ES',
      en: 'EN'
    },
    actions: {
      logout: 'Sign out',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      label: 'Actions'
    },
    search: {
      placeholder: 'Search...'
    },
    pagination: {
      page: 'Page {{current}} of {{total}}',
      items: '{{count}} results',
      previous: 'Previous',
      next: 'Next'
    },
    feedback: {
      created: 'Created successfully.',
      updated: 'Changes saved.',
      deleted: 'Deleted successfully.',
      error: 'Could not complete the action.'
    },
    validation: {
      required: 'This field is required.',
      maxLength: 'Maximum {{max}} characters.',
      country: 'Select a country (2-letter ISO code).',
      email: 'Enter a valid email.',
      uuid: 'Must be a valid UUID.',
      fix: 'Please review the highlighted fields.'
    },
    units: {
      hour: 'h',
      minute: 'min'
    },
    days: {
      MONDAY: 'Monday',
      TUESDAY: 'Tuesday',
      WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday',
      FRIDAY: 'Friday',
      SATURDAY: 'Saturday',
      SUNDAY: 'Sunday'
    },
    dataState: {
      loading: 'Loading...',
      error: 'Could not load the data.',
      empty: 'Nothing to show yet.',
      retry: 'Retry'
    },
    placeholder: {
      pending: 'Module pending',
      title: 'Under construction',
      service: 'Requires the microservice',
      planned: 'Planned capabilities:'
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
      usernamePlaceholder: 'you@example.com',
      passwordPlaceholder: '••••••••',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      submit: 'Sign in',
      submitting: 'Signing in...'
    },
    register: {
      title: 'Create account',
      email: 'Email',
      emailPlaceholder: 'you@email.com',
      password: 'Password',
      passwordHint: 'At least {{min}} characters.',
      confirm: 'Confirm password',
      submit: 'Create account',
      submitting: 'Creating account...',
      prompt: "Don't have an account?",
      switchToRegister: 'Sign up',
      haveAccount: 'Already have an account?',
      switchToLogin: 'Sign in',
      errors: {
        emailTaken: 'That email is already registered.',
        passwordTooShort: 'Password must be at least {{min}} characters.',
        passwordMismatch: 'Passwords do not match.',
        failed: 'Could not create the account.'
      }
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
      tenant: 'Local tenant',
      systemAdmin: 'System administration',
      guest: 'Guest'
    },
    scope: {
      platform: 'Platform',
      tenant: 'Organization',
      guest: 'Guest'
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
      scope: 'Scope',
      tenant: 'Tenant',
      workspace: 'Workspace',
      subject: 'Subject'
    },
    claims: {
      title: 'Claims'
    },
    footer: {
      platform: 'Hermes Calendar Platform',
      oauthLocal: 'Local OAuth2/OIDC'
    }
  },
  app: {
    nav: {
      ariaLabel: 'Main navigation',
      toggle: 'Toggle menu',
      pendingHint: 'Module pending backend',
      overview: 'Overview',
      catalog: 'Catalog',
      schedule: 'Schedule',
      reports: 'Reports',
      appointments: 'Appointments',
      bookings: 'My bookings',
      payments: 'Payments',
      team: 'Team',
      organization: 'Organization',
      tenants: 'Organizations',
      users: 'Users',
      explore: 'Explore'
    },
    roles: {
      'system-admin': 'System administrator',
      'tenant-admin': 'Organization administrator',
      'tenant-partner': 'Partner',
      guest: 'Guest'
    },
    orgSwitcher: {
      label: 'Active organization'
    }
  },
  overview: {
    eyebrow: 'Dashboard',
    greeting: 'Hi, {{name}}',
    sessionActive: 'Session active',
    quickLinks: 'Quick links',
    fallback: {
      user: 'Hermes user',
      tenant: 'Your organization',
      systemAdmin: 'System administration',
      guest: 'Guest'
    },
    intro: {
      'system-admin': 'Manage organizations and users across the whole Hermes platform.',
      'tenant-admin': 'Manage your service catalog, your schedule and your team.',
      'tenant-partner': 'Operate the schedule: create and manage the organization appointments.',
      guest: 'Explore the available services and find where to book.'
    },
    guest: {
      next: 'Your next appointment',
      service: 'Your service',
      viewBooking: 'View my bookings',
      payNow: 'Pay now',
      noNext: 'You have no appointments yet',
      noNextHint: 'Explore the available services and book your first appointment.',
      exploreCta: 'Explore services',
      upcoming: 'Upcoming appointments',
      pendingPayment: 'Pending payment'
    },
    tenant: {
      offerings: 'Services',
      activeOfferings: 'Active services',
      members: 'Team members'
    },
    admin: {
      tenants: 'Organizations',
      users: 'Users'
    },
    links: {
      catalog: 'Go to catalog',
      schedule: 'View schedule',
      team: 'Manage team',
      tenants: 'Manage organizations',
      users: 'Manage users',
      explore: 'Explore services',
      appointments: 'Manage appointments',
      payments: 'Set up payments',
      bookings: 'My bookings'
    }
  },
  catalog: {
    eyebrow: 'Catalog',
    title: 'Services',
    description: 'Define the services your organization offers for booking.',
    empty: 'You have not created services yet. Create the first one.',
    searchPlaceholder: 'Search by name or category...',
    allStatus: 'All statuses',
    actions: {
      new: 'New service',
      activate: 'Activate',
      deactivate: 'Deactivate'
    },
    status: {
      active: 'Active',
      inactive: 'Inactive'
    },
    badges: {
      onlinePayment: 'Online payment',
      requirements: '{{count}} requirements'
    },
    toast: {
      activated: 'Service activated.',
      deactivated: 'Service deactivated.'
    },
    confirm: {
      deactivateTitle: 'Deactivate service',
      deactivateMessage: 'Deactivate "{{name}}"? It will no longer be bookable.'
    },
    requirements: {
      title: 'Requirements / attachments',
      add: 'Add requirement',
      empty: 'No requirements. Add the data or attachments you will ask for at booking.',
      label: 'Label',
      type: 'Type',
      required: 'Required',
      types: {
        TEXT: 'Text',
        NUMBER: 'Number',
        DATE: 'Date',
        BOOLEAN: 'Yes / No',
        FILE: 'File'
      }
    },
    fields: {
      name: 'Name',
      category: 'Category',
      modality: 'Modality',
      duration: 'Duration (min)',
      price: 'Price',
      currency: 'Currency',
      description: 'Description',
      status: 'Status',
      requiresOnlinePayment: 'Requires upfront online payment'
    },
    hints: {
      name: 'The service name your clients will see.',
      category: 'Groups similar services (e.g. Consultations, Vaccines).',
      modality: 'How it is delivered: in person, virtual or both.',
      duration: 'How long each appointment lasts, in minutes.',
      price: 'Price per appointment. Use 0 if it is free.',
      currency: 'Currency you charge this service in.',
      description: 'Details that help the client decide.'
    },
    payment: {
      needsConfig: 'To charge upfront you must first set up and enable online payments.',
      configure: 'Set up payments'
    },
    modality: {
      IN_PERSON: 'In person',
      VIRTUAL: 'Virtual',
      BOTH: 'Both'
    },
    form: {
      createTitle: 'New service',
      editTitle: 'Edit service'
    }
  },
  schedule: {
    eyebrow: 'Schedule',
    title: 'Business hours',
    description: 'Set the weekly hours and exceptions (closures or special days).',
    hours: {
      title: 'Weekly hours',
      save: 'Save hours',
      invalidRange: 'On {{day}}, the opening time must be earlier than the closing time.',
      noneTitle: 'No open days',
      noneMessage: 'You left no open days: clients won’t be able to book. Save anyway?'
    },
    exceptions: {
      title: 'Exceptions',
      add: 'Add exception',
      empty: 'No exceptions registered.',
      invalidRange: 'The opening time must be earlier than the closing time.',
      date: 'Date',
      dateHint: 'A specific day that overrides your usual hours.',
      type: 'Type',
      typeHint: 'Closed all day, or special hours just for that day.',
      closed: 'Closed',
      customHours: 'Custom hours',
      opensAt: 'Opens',
      closesAt: 'Closes',
      description: 'Description',
      descriptionHint: 'Reason for the exception (optional), e.g. Holiday.'
    },
    toast: {
      hoursSaved: 'Hours saved.',
      exceptionAdded: 'Exception added.'
    },
    confirm: {
      deleteExceptionTitle: 'Delete exception',
      deleteExceptionMessage: 'Delete this exception from the calendar?'
    }
  },
  team: {
    eyebrow: 'Team',
    title: 'Organization members',
    description: 'Add professionals to your organization or remove them.',
    addAsPartner: 'Added as Professional. The Administrator role is granted only by the system administrator.',
    empty: 'No members besides you yet.',
    searchPlaceholder: 'Search by ID or role...',
    allRoles: 'All roles',
    actions: {
      add: 'Add member'
    },
    toast: {
      added: 'Member added.'
    },
    confirm: {
      removeTitle: 'Remove member',
      removeMessage: 'Remove user {{id}} from the organization?'
    },
    fields: {
      userId: 'User ID',
      userIdHint: 'The user UUID. Each person finds theirs on their "Account" screen.',
      role: 'Role',
      roleHint: 'Admin manages the whole organization; Professional only handles their appointments.',
      roles: 'Roles',
      status: 'Status',
      since: 'Since'
    },
    roles: {
      TENANT_ADMIN: 'Administrator',
      TENANT_STAFF: 'Staff'
    }
  },
  organization: {
    eyebrow: 'Organization',
    title: 'Organization profile',
    description: 'Update your organization contact details.',
    saved: 'Changes saved',
    readonlyNote: 'Name, country and city can only be changed by a system administrator.',
    fields: {
      name: 'Name',
      taxId: 'Tax ID',
      country: 'Country',
      countryPlaceholder: 'Select a country',
      city: 'City',
      address: 'Address',
      description: 'Description'
    },
    hints: {
      name: 'Public trading name of the organization.',
      taxId: 'Tax identification number, without dots.',
      country: 'Country where the organization is registered.',
      city: 'Main city where you operate.',
      address: 'Physical address where you serve clients.',
      description: 'A short description your clients will see.'
    }
  },
  admin: {
    tenants: {
      eyebrow: 'Administration',
      title: 'Organizations',
      description: 'Manage the organizations registered on the platform.',
      empty: 'No organizations registered.',
      searchPlaceholder: 'Search by name, slug or city...',
      allStatus: 'All statuses',
      name: 'Name',
      slug: 'Slug',
      location: 'Location',
      status: 'Status',
      statusValues: {
        ACTIVE: 'Active',
        INACTIVE: 'Inactive'
      },
      created: 'Created',
      suspend: 'Deactivate',
      activate: 'Activate',
      new: 'New organization',
      create: 'Create organization',
      createTitle: 'New organization',
      editTitle: 'Edit organization',
      members: 'Members',
      confirm: {
        suspendTitle: 'Deactivate organization',
        suspendMessage: 'Deactivate "{{name}}"? Its members will lose access to operations.'
      }
    },
    members: {
      title: 'Members of {{name}}',
      pickUser: 'User',
      pickPlaceholder: 'Search by username or email...',
      pickHint: 'Pick a registered user. As TENANT_ADMIN they will manage the organization.',
      searchEmpty: 'No users available to add.',
      moreResults: 'More matches available; refine your search.',
      clear: 'Clear selection',
      filterRole: 'Filter by role',
      allRoles: 'All roles',
      hideLocked: 'Hide locked',
      matches: '{{count}} available',
      assignRole: 'Role in organization',
      assignRoleHint: 'Admin manages the organization; Professional handles appointments.',
      empty: 'No members yet. Find a user above and add them.',
      roles: {
        TENANT_ADMIN: 'Administrator',
        TENANT_PARTNER: 'Partner'
      }
    },
    users: {
      eyebrow: 'Administration',
      title: 'Users',
      description: 'Review and manage user accounts.',
      empty: 'No users registered.',
      searchPlaceholder: 'Search by username or email...',
      allRoles: 'All roles',
      allStatus: 'All statuses',
      editTitle: 'Edit user',
      username: 'Username',
      usernameHint: 'Name the user signs in with.',
      email: 'Email',
      emailHint: 'User contact email.',
      roles: 'Roles',
      status: 'Status',
      created: 'Created',
      active: 'Active',
      disabled: 'Disabled',
      locked: 'Locked',
      lock: 'Lock',
      unlock: 'Unlock',
      toast: {
        locked: 'User locked.',
        unlocked: 'User unlocked.'
      },
      confirm: {
        lockTitle: 'Lock user',
        lockMessage: 'Lock "{{name}}"? They will not be able to sign in until unlocked.'
      }
    }
  },
  explore: {
    eyebrow: 'Book in minutes',
    title: 'Find services',
    heroTitle: 'Book your next appointment',
    heroSubtitle: 'Browse services from Hermes organizations and book your slot in seconds.',
    description: 'Search for services available across Hermes organizations.',
    search: 'Search',
    book: 'Book now',
    onlinePayment: 'Online payment',
    anyModality: 'Any modality',
    noResults: 'No services found for your search.',
    fields: {
      query: 'Search',
      queryPlaceholder: 'e.g. consultation, advisory, haircut...'
    }
  },
  appointments: {
    eyebrow: 'Operations',
    title: 'Appointments',
    listDescription: 'Manage your organization appointments: cancel or reschedule by status.',
    searchPlaceholder: 'Search by service or customer...',
    allStatus: 'All statuses',
    empty: 'No appointments yet.',
    columns: {
      service: 'Service',
      customer: 'Customer',
      start: 'Start',
      status: 'Status',
      price: 'Price'
    },
    status: {
      PENDING_PAYMENT: 'Pending payment',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      NO_SHOW: 'No-show',
      EXPIRED: 'Expired'
    },
    actions: {
      cancel: 'Cancel',
      reschedule: 'Reschedule',
      view: 'View',
      complete: 'Completed',
      noShow: 'No-show'
    },
    scope: {
      label: 'When',
      all: 'All',
      today: 'Today',
      upcoming: 'Upcoming',
      past: 'Past'
    },
    detail: {
      title: 'Appointment detail',
      service: 'Service',
      customer: 'Customer (ID)',
      when: 'When',
      duration: '{{minutes}} min',
      price: 'Price',
      payment: 'Payment',
      paymentOnline: 'Online, upfront',
      paymentOnsite: 'No online payment required',
      created: 'Booked on',
      requirements: 'Details provided by the customer',
      noRequirements: 'The customer provided no extra details.'
    },
    confirm: {
      cancelTitle: 'Cancel appointment',
      cancelMessage: 'Are you sure you want to cancel this appointment?',
      completeTitle: 'Mark as completed',
      completeMessage: 'Confirm the appointment was attended? This cannot be undone.',
      noShowTitle: 'Mark as no-show',
      noShowMessage: 'Confirm the customer did not show up? This cannot be undone.'
    },
    toast: {
      cancelled: 'Appointment cancelled.',
      rescheduled: 'Appointment rescheduled.',
      completed: 'Appointment marked as completed.',
      noShow: 'Appointment marked as no-show.'
    },
    reschedule: {
      title: 'Reschedule: {{service}}',
      date: 'New date',
      dateHint: 'Pick a new date and choose an available time.',
      slots: 'Available times',
      noSlots: 'No times available that day. Try another date.',
      pickSlot: 'Pick an available time.',
      conflict: 'That time is no longer available. Pick another.',
      submit: 'Reschedule'
    }
  },
  reports: {
    eyebrow: 'Analytics',
    title: 'Reports',
    description: 'Generate and view reports about your organization operation.',
    capabilities: {
      appointments: 'Appointment reports by state and period',
      revenue: 'Revenue, payments and copays',
      occupancy: 'Occupancy and service performance'
    }
  },
  bookings: {
    eyebrow: 'Bookings',
    title: 'My bookings',
    listDescription: 'Your booked appointments. You can reschedule or cancel them while active.',
    explore: 'Explore services',
    empty: 'No bookings yet. Explore the services and book your first appointment.',
    sections: {
      upcoming: 'Upcoming',
      past: 'History'
    },
    loadMore: 'Load more ({{count}})',
    confirm: {
      cancelTitle: 'Cancel booking',
      cancelMessage: 'Are you sure you want to cancel this booking?'
    },
    book: {
      title: 'Book: {{service}}',
      date: 'Date',
      dateHint: 'Pick the day of your appointment to see available times.',
      slots: 'Available times',
      noSlots: 'No times available that day. Try another date.',
      pickSlot: 'Pick an available time.',
      requirements: 'Required details',
      fillRequired: 'Fill in the required details.',
      typeHint: {
        NUMBER: 'Enter numbers only.',
        DATE: 'Select a date.',
        FILE: 'Attach the requested file.'
      },
      paymentNote: 'requires online payment',
      confirm: 'Confirm booking',
      booking: 'Booking...',
      booked: 'Booking created. Check it in "My bookings".'
    },
    pay: {
      action: 'Pay',
      title: 'Pay: {{service}}',
      bank: 'Bank (PSE)',
      bankHint: 'Choose the bank you will pay from with PSE.',
      pickBank: 'Select your bank',
      legalType: 'Person type',
      legal: { NATURAL: 'Individual', JURIDICAL: 'Company' },
      documentType: 'Document type',
      documentNumber: 'Document number',
      documentNumberHint: 'Numbers only, no dots or dashes.',
      documentNumberInvalid: 'Enter numbers only, no dots or dashes.',
      phoneInvalid: 'Enter a valid phone number.',
      fullName: 'Full name',
      fullNameHint: 'As it appears on your ID document.',
      email: 'Email',
      emailHint: 'We will send your payment receipt here.',
      phone: 'Phone',
      phoneHint: 'Contact number in case of any issue with the payment.',
      submit: 'Go to pay',
      processing: 'Redirecting...',
      unavailable: 'The payment service is unavailable right now. Please try again in a few minutes.'
    },
    return: {
      title: 'Payment in progress',
      message: 'We are confirming your payment. Your booking status will update as soon as we receive it.',
      failedTitle: 'Payment not completed',
      failedMessage: 'The payment could not be processed. You can try again from your booking.',
      action: 'View my bookings'
    }
  },
  account: {
    eyebrow: 'Account',
    title: 'My account',
    description: 'Your sign-in and session details in Hermes.',
    guest: {
      clientNote: 'You are using Hermes as a client: book and manage your appointments. Nothing else to set up.',
      staffQuestion: 'Do you work at a business that uses Hermes?',
      staffHint: 'Share your user ID (above) with the business administrator so they can add you and you can manage its schedule.'
    },
    workspace: 'Organization',
    profile: {
      title: 'Profile',
      email: 'Email',
      role: 'Role',
      userId: 'User ID',
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Could not copy. Copy it manually.',
      phone: 'Phone',
      phoneHint: 'We use it to send you SMS reminders for your appointments.',
      saved: 'Phone updated.'
    },
    password: {
      title: 'Change password',
      intro: 'We send a code to your email; use it below to set a new password.',
      request: 'Send code to my email',
      sending: 'Sending...',
      resend: 'Resend code',
      requestSent: 'Code sent. Check your email.',
      token: 'Code',
      tokenHint: 'The code that arrived in your email.',
      newPassword: 'New password',
      newPasswordHint: 'At least 8 characters.',
      confirmPassword: 'Confirm password',
      confirmPasswordHint: 'Repeat the same password to confirm.',
      submit: 'Change password',
      changed: 'Password updated.',
      mismatch: 'Passwords do not match.',
      tooShort: 'Password must be at least {{min}} characters.'
    }
  },
  payments: {
    eyebrow: 'Collections',
    title: 'Payment settings',
    description: 'Connect your PSE gateway to charge for your service bookings.',
    notConfigured: 'Not configured',
    active: 'Collections on',
    inactive: 'Collections off',
    configured: 'Already set',
    secretHint: 'Stored only; never shown again. Leave empty to keep it unchanged.',
    updatedAt: 'Updated on {{date}}',
    saved: 'Settings saved.',
    enableNeedsConfig: 'To enable payments, complete the merchant account, public key and both secrets.',
    delete: 'Delete configuration',
    deleted: 'Configuration deleted.',
    deleteConfirm: {
      title: 'Delete payment configuration',
      message: 'Delete the configuration? You will no longer be able to charge online.'
    },
    fields: {
      provider: 'Gateway',
      enabled: 'Enable online collections',
      merchantAccount: 'Merchant account',
      publicKey: 'Public key',
      privateKey: 'Private key',
      eventsSecret: 'Events secret'
    },
    hints: {
      provider: 'Gateway that will process online payments.',
      merchantAccount: 'Your merchant identifier in the gateway.',
      publicKey: 'Public key provided by the gateway.'
    },
    providers: {
      FAKE_PSE: 'Test PSE',
      WOMPI: 'Wompi',
      PAYU: 'PayU'
    },
    received: {
      title: 'Payments received'
    },
    history: {
      title: 'Payment history',
      empty: 'No payments yet.',
      date: 'Date',
      amount: 'Amount',
      status: 'Status',
      appointment: 'Appointment',
      resume: 'Continue payment',
      showingLatest: 'showing the latest {{count}}',
      statuses: {
        PENDING: 'Pending',
        PAID: 'Paid',
        FAILED: 'Failed',
        EXPIRED: 'Expired',
        CANCELLED: 'Cancelled'
      }
    }
  },
  landing: {
    nav: {
      signIn: 'Sign in',
      getStarted: 'Create account'
    },
    hero: {
      eyebrow: 'Bookings · Schedule · Payments',
      titleLead: 'Your business,',
      titleKey: 'coordinated',
      titleTail: 'to the minute.',
      lede: 'Hermes brings your service catalog, your schedule and your payments into one platform. You set the hour; we keep it.',
      primary: 'Create account',
      secondary: 'Sign in',
      coords: '04.711°N · 74.072°W · LOCAL TIME',
      readout: 'Booked'
    },
    pillars: {
      eyebrow: 'One platform',
      title: 'Everything that moves your schedule',
      catalog: {
        tag: 'catalog',
        title: 'Your services, clear',
        body: 'Publish services with price, duration and the details you ask for at booking. Activate them or make them invisible anytime.'
      },
      schedule: {
        tag: 'schedule',
        title: 'Your hours, your rules',
        body: 'Set the weekly hours and holidays. Hermes honors every closure and every special day.'
      },
      team: {
        tag: 'team',
        title: 'Each person, their role',
        body: 'Add administrators and partners. Everyone sees and does exactly what they should.'
      }
    },
    lifecycle: {
      eyebrow: 'The life of an appointment',
      title: 'From booking to payment, without losing the thread',
      reserved: { name: 'Booked', note: 'The client picks an hour and leaves their details.' },
      paid: { name: 'Paid', note: 'Payment or copay confirmed upfront.' },
      attended: { name: 'Attended', note: 'The appointment happens and your team marks it.' },
      completed: { name: 'Completed', note: 'Closed and ready for the report.' },
      foot: 'Also: No-show · Cancelled · Finished'
    },
    roles: {
      eyebrow: 'Four roles',
      title: 'A coordination for every actor',
      admin: {
        title: 'System administrator',
        body: 'Onboards organizations and users across the whole platform.'
      },
      tenantAdmin: {
        title: 'Organization administrator',
        body: 'Manages the catalog, the schedule and the team of their business.'
      },
      partner: {
        title: 'Partner',
        body: 'Operates the schedule: creates, changes and closes the day’s appointments.'
      },
      guest: {
        title: 'Guest',
        body: 'Searches for services, books an hour and pays online.'
      }
    },
    final: {
      title: 'Set your schedule straight',
      lede: 'Create your account and start coordinating bookings today.',
      cta: 'Create account'
    },
    footer: {
      left: 'Hermes Calendar — Booking platform',
      right: 'OAuth2/OIDC · Microservices'
    }
  }
};
