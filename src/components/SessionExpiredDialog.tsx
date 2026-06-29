import { useState } from 'react';
import { LogIn, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui';
import { authService } from '../hermes-security/authService';
import { clearSession } from '../hermes-security/sessionStore';

/**
 * Diálogo bloqueante de sesión expirada: cubre toda la app, no se puede descartar (sin botón de cerrar,
 * sin Escape ni clic fuera) y obliga a reautenticarse. Lo monta el AuthProvider cuando una llamada
 * autenticada devuelve 401.
 */
export function SessionExpiredDialog() {
  const { t } = useTranslation('auth');
  const [busy, setBusy] = useState(false);

  async function reauthenticate() {
    setBusy(true);
    // Cerramos la sesión del BFF para expirar su cookie HttpOnly: sin esto la sesión "reaparece" al
    // recargar (el navegador la reenvía) y vuelve el bucle de 401. Idempotente con la limpieza del
    // AuthProvider; aquí la esperamos para garantizar el cookie expirado antes de redirigir.
    await authService.endServerSession();
    clearSession();
    // Recarga completa a la pantalla de acceso: descarta el estado de React y rehace el flujo de login.
    window.location.assign('/acceso');
  }

  return (
    <div className="session-expired-overlay" role="alertdialog" aria-modal="true" aria-labelledby="session-expired-title">
      <div className="session-expired-card">
        <span className="session-expired-icon" aria-hidden="true">
          <ShieldAlert size={26} />
        </span>
        <h2 id="session-expired-title">{t('sessionExpired.title')}</h2>
        <p>{t('sessionExpired.message')}</p>
        <Button icon={<LogIn size={17} />} fullWidth disabled={busy} onClick={reauthenticate}>
          {t('sessionExpired.action')}
        </Button>
      </div>
    </div>
  );
}
