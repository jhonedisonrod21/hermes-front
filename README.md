# Hermes Front

Base React para probar la autenticacion local de Hermes.

## Requisitos

- Node.js 20 o superior.
- `hermes-api-gateway` disponible en `http://127.0.0.1:8080`.
- El gateway enruta `/auth/**` hacia `hermes-auth-server` y `/bff/**` hacia `hermes-web-bff`.
- Para usar el BFF, registra el callback de Spring OAuth2 Client:

```bash
HERMES_WEB_CLIENT_REDIRECT_URIS=http://127.0.0.1:5173/bff/login/oauth2/code/hermes-web-client,https://oauth.pstmn.io/v1/callback
```

Si el cliente `hermes-web-client` ya fue sembrado en la base de datos antes de cambiar esa variable, elimina o actualiza el registro de `oauth2_registered_client` para que tome el nuevo `redirect_uri`.

El servidor Vite usa `strictPort` en `127.0.0.1:5173`. Si ese puerto esta ocupado, Vite fallara en vez de moverse a `5174`, porque un puerto distinto cambia el `redirect_uri` y Spring Authorization Server responde `400 Bad Request`.

El callback OAuth ahora lo maneja `hermes-web-bff` a traves del gateway; React no recibe ni almacena tokens.

## Ejecutar

```bash
npm install
npm run dev
```

Abre `http://127.0.0.1:5173`.

Usuario semilla del backend:

- Usuario: `admin@hermes.local`
- Password: `admin123`

## Estructura de seguridad

- `src/hermes-security/authConfig.ts`: URLs del auth-server, BFF y proxy de API.
- `src/hermes-security/authService.ts`: login local, redireccion al BFF, consulta de sesion y logout.
- `src/hermes-security/sessionStore.ts`: utilidades de sesion sin persistir tokens.
- `src/hermes-security/AuthProvider.tsx`: contexto React de sesion.
- `src/hermes-security/httpClient.ts`: fetch helper contra el BFF usando cookies de sesion.

## Arquitectura del frontend

Todas las llamadas a microservicios salen como `/bff/api/<servicio>/<path>`. La cadena es:
`React → proxy Vite → gateway (:8080) → hermes-web-bff (quita el prefijo `/api`) → gateway `/<servicio>/**``.
El BFF adjunta el JWT del usuario derivado de la cookie de sesion; React nunca ve tokens.

- `src/api/http.ts`: cliente HTTP tipado (`api.get/post/put/patch/delete`), `ApiError`, `buildQuery`, tipo `Page<T>`.
- `src/api/services.ts`: clientes por dominio (`catalogApi`, `schedulingApi`, `tenantApi`, `identityApi`).
- `src/api/types.ts`: tipos de dominio derivados de los contratos OpenAPI.
- `src/hooks/useResource.ts` y `useMutation.ts`: carga de datos y mutaciones con estado.
- `src/hooks/useClientTable.ts`: busqueda + paginacion en el cliente sobre una ventana cargada
  (los endpoints de listado no ofrecen filtro `q`, asi que se filtra/pagina localmente).
- `src/components/feedback/toast.tsx` (`useToast`) y `confirm.tsx` (`useConfirm`): notificaciones
  y dialogos de confirmacion, montados como providers en `main.tsx`.
- `src/components/ui/`: design system reutilizable (`Button`, `Card`, `Badge`, `TextField`,
  `Select`, `Textarea`, `Checkbox`, `SearchInput`, `Pagination`, `IconButton`, `BrandLogo`).
- `src/components/AppShell.tsx`: layout con sidebar (Design System §3.4) y navegacion segun rol.
- `src/app/navigation.ts` y `AppRoutes.tsx`: navegacion y rutas guardadas por `actorKind`.

### Modelo de 4 actores (`actorKind`)

`actorKind(profile)` clasifica por rol del JWT en cuatro actores, cada uno con su navegacion:

- **system-admin** (`SYSTEM_ADMIN`, p. ej. `admin@hermes.local`): Resumen, Organizaciones (`/admin/tenants`), Usuarios (`/admin/usuarios`).
- **tenant-admin** (`TENANT_ADMIN`): Resumen, Catalogo (`/catalogo`), Agenda (`/agenda`), Reportes (`/reportes`)*, Equipo (`/equipo`), Organizacion (`/organizacion`).
- **tenant-partner** (`TENANT_PARTNER`): Resumen, Citas (`/citas`)*.
- **guest** (`GUEST_USER` / sin tenant): Resumen, Explorar (`/explorar`), Mis reservas (`/mis-reservas`)*.

Todos los actores tienen `Cuenta` (`/cuenta`, accesible desde el menu de usuario): muestra perfil, rol y el **userId copiable** (util para que un admin asocie a un invitado a una organizacion).

> *Modulos marcados con `*` y con un punto ambar en el sidebar aun no tienen microservicio
> (citas, reportes, reservas/pagos, cambio de contraseña). Su navegacion existe y muestran una
> pantalla "en construccion" que nombra el servicio backend pendiente; quedan listos para cablear.

> El usuario semilla es SYSTEM_ADMIN (sin tenant): vera las pantallas de administracion.
> Las pantallas de catalogo/agenda/equipo son *tenant-scoped* y requieren una cuenta con tenant.

### Registro y alta de organizacion

- **Auto-registro (invitado):** la pantalla de login tiene un modo "Crear cuenta" que llama
  `POST /identity/users/register` (publico en el gateway). Crea un `GUEST_USER` sin tenant y
  enseguida inicia sesion. Esta llamada va por la ruta `/identity` (proxy de Vite) y **no** por el
  proxy autenticado del BFF.
- **Alta de organizacion:** el provisioning interno (`/*/internal/**`) esta `denyAll` en el gateway
  y exige llave interna entre servicios, asi que el navegador no puede crearla. La via disponible es
  que un **SYSTEM_ADMIN** cree la organizacion en *Organizaciones → Nueva organizacion*
  (`POST /tenant/admin/tenants`) y luego asigne al usuario registrado como miembro `TENANT_ADMIN`
  (boton *Miembros*). Con esa membresia, el invitado pasa a ver la experiencia de tenant.

> Si cambias `vite.config.ts` (p. ej. el proxy `/identity`), reinicia `npm run dev` para que tome la nueva config.
