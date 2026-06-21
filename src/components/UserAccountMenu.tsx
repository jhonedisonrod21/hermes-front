import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, LogOut, UserCircle, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { actorKind, type HermesProfile } from '../hermes-security/sessionStore';

type UserAccountMenuProps = {
  profile?: HermesProfile;
  onLogout: () => Promise<void>;
};

function displayName(profile?: HermesProfile, fallback = 'Hermes user') {
  return profile?.preferred_username ?? profile?.email ?? profile?.sub ?? fallback;
}

function firstName(profile?: HermesProfile, fallback = 'Hermes') {
  const source = profile?.preferred_username ?? profile?.email ?? profile?.sub ?? fallback;
  const localPart = source.includes('@') ? source.split('@')[0] : source;
  return localPart.split(/[.\s_-]+/).find(Boolean) ?? fallback;
}

export function UserAccountMenu({ profile, onLogout }: UserAccountMenuProps) {
  const { t } = useTranslation(['common', 'dashboard']);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = useMemo(() => displayName(profile, t('dashboard:fallback.user')), [profile, t]);
  const userFirstName = useMemo(() => firstName(profile, t('dashboard:fallback.user')), [profile, t]);
  const kind = actorKind(profile);
  const workspaceLabel =
    kind === 'system-admin'
      ? t('dashboard:fallback.systemAdmin')
      : kind === 'guest'
        ? t('dashboard:fallback.guest')
        : profile?.tenant_name ?? profile?.tenant_slug ?? t('dashboard:fallback.tenant');

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="user-menu-trigger"
        onClick={() => setOpen((visible) => !visible)}
        type="button"
      >
        <span className="user-menu-avatar" aria-hidden="true">
          <UserRound size={18} />
        </span>
        <span className="user-menu-first-name">{userFirstName}</span>
        <ChevronDown className={open ? 'user-menu-chevron user-menu-chevron-open' : 'user-menu-chevron'} size={16} />
      </button>

      {open ? (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-summary">
            <span className="user-menu-summary-avatar" aria-hidden="true">
              <UserRound size={22} />
            </span>
            <div>
              <strong>{userName}</strong>
              <span>{workspaceLabel}</span>
            </div>
          </div>

          <a className="user-menu-item" href="/profile" role="menuitem">
            <UserCircle size={18} />
            {t('dashboard:userMenu.profile')}
          </a>

          <div className="user-menu-language">
            <LanguageSwitcher />
          </div>

          <button className="user-menu-item user-menu-item-danger" onClick={onLogout} role="menuitem" type="button">
            <LogOut size={18} />
            {t('common:actions.logout')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
