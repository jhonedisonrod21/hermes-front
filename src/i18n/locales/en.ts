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
      usernamePlaceholder: 'admin@hermes.local',
      passwordPlaceholder: 'admin123',
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
      bookings: 'My bookings'
    }
  },
  catalog: {
    eyebrow: 'Catalog',
    title: 'Services',
    description: 'Define the services your organization offers for booking.',
    empty: 'You have not created services yet. Create the first one.',
    searchPlaceholder: 'Search by name or category...',
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
      save: 'Save hours'
    },
    exceptions: {
      title: 'Exceptions',
      add: 'Add exception',
      empty: 'No exceptions registered.',
      date: 'Date',
      type: 'Type',
      closed: 'Closed',
      customHours: 'Custom hours',
      opensAt: 'Opens',
      closesAt: 'Closes',
      description: 'Description'
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
    description: 'Add or remove members and set their role in the organization.',
    empty: 'No members besides you yet.',
    searchPlaceholder: 'Search by ID or role...',
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
      userIdHint: 'The user identifier in Hermes (UUID).',
      role: 'Role',
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
    }
  },
  admin: {
    tenants: {
      eyebrow: 'Administration',
      title: 'Organizations',
      description: 'Manage the organizations registered on the platform.',
      empty: 'No organizations registered.',
      searchPlaceholder: 'Search by name, slug or city...',
      name: 'Name',
      slug: 'Slug',
      location: 'Location',
      status: 'Status',
      created: 'Created',
      suspend: 'Suspend',
      activate: 'Activate',
      new: 'New organization',
      create: 'Create organization',
      createTitle: 'New organization',
      editTitle: 'Edit organization',
      members: 'Members',
      confirm: {
        suspendTitle: 'Suspend organization',
        suspendMessage: 'Suspend "{{name}}"? Its members will lose access to operations.'
      }
    },
    members: {
      title: 'Members of {{name}}',
      pickUser: 'User',
      pickPlaceholder: 'Search by username or email...',
      pickHint: 'Pick a registered user. As TENANT_ADMIN they will manage the organization.',
      searchEmpty: 'No users available to add.',
      clear: 'Clear selection',
      empty: 'This organization has no members yet.',
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
      editTitle: 'Edit user',
      username: 'Username',
      email: 'Email',
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
    eyebrow: 'Explore',
    title: 'Find services',
    description: 'Search for services available across Hermes organizations.',
    search: 'Search',
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
    description: 'Create and manage appointments, bookings and their state lifecycle.',
    capabilities: {
      create: 'Create appointments / bookings',
      reschedule: 'Reschedule an appointment',
      cancel: 'Delete or cancel an appointment',
      markStates: 'Mark states: completed, no-show, paid, finished, cancelled'
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
    eyebrow: 'My bookings',
    title: 'Bookings and payments',
    description: 'Book an appointment slot and pay for the services.',
    capabilities: {
      book: 'Book an appointment slot',
      pay: 'Make a payment',
      history: 'Booking history and receipts'
    }
  },
  account: {
    eyebrow: 'Account',
    title: 'My account',
    description: 'Your sign-in and session details in Hermes.',
    guestHint: 'You do not belong to any organization yet. Share your user ID with an administrator so they can add you.',
    workspace: 'Organization',
    profile: {
      title: 'Profile',
      email: 'Email',
      role: 'Role',
      userId: 'User ID',
      copy: 'Copy',
      copied: 'Copied'
    },
    password: {
      title: 'Change password',
      pending: 'Password change will be available once the identity service exposes it.'
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
