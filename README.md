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
