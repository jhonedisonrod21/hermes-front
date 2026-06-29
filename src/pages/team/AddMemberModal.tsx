import { useEffect, useState, type FormEvent } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Button, TextField } from '../../components/ui';
import { useToast } from '../../components/feedback/toast';
import { tenantApi, identityApi } from '../../api/services';
import { ApiError } from '../../api/http';
import type { UserCardResponse } from '../../api/types';

// El TENANT_ADMIN solo da de alta colaboradores; el rol Administrador lo concede el admin del sistema.
const ADD_ROLE = 'TENANT_PARTNER';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
};

/** Invita a un miembro buscándolo por correo (sin manejar el id). Lo añade como colaborador. */
export function AddMemberModal({ open, onClose, onAdded }: Readonly<Props>) {
  const { t } = useTranslation(['team', 'common']);
  const toast = useToast();
  const [email, setEmail] = useState('');
  // undefined = aún no se buscó · null = no encontrado · card = encontrado
  const [found, setFound] = useState<UserCardResponse | null | undefined>(undefined);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail('');
      setFound(undefined);
    }
  }, [open]);

  async function search(e?: FormEvent) {
    e?.preventDefault();
    const value = email.trim();
    if (!value) return;
    setSearching(true);
    setFound(undefined);
    try {
      setFound(await identityApi.findUserByEmail(value));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setFound(null);
      else toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setSearching(false);
    }
  }

  async function add() {
    if (!found) return;
    setAdding(true);
    try {
      await tenantApi.addMyMember({ userId: found.id, role: ADD_ROLE });
      toast.success(t('team:toast.added'));
      onAdded();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) toast.error(t('team:add.alreadyMember'));
      else toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setAdding(false);
    }
  }

  return (
    <Modal
      open={open}
      title={t('team:add.title')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={adding}>{t('common:actions.cancel')}</Button>
          {found ? (
            <Button icon={<UserPlus size={16} />} onClick={add} disabled={adding}>
              {adding ? t('common:actions.saving') : t('team:add.confirm')}
            </Button>
          ) : null}
        </>
      }
    >
      <form className="hc-form" onSubmit={search}>
        <p className="hc-field-message">{t('team:addAsPartner')}</p>
        <div className="member-search-row">
          <TextField
            label={t('team:add.email')}
            type="email"
            autoComplete="off"
            placeholder={t('team:add.emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFound(undefined);
            }}
          />
          <Button type="submit" variant="secondary" icon={<Search size={16} />} disabled={searching || !email.trim()}>
            {t('team:add.search')}
          </Button>
        </div>
      </form>

      {found ? (
        <div className="member-found">
          <strong>{found.name || found.email}</strong>
          <span className="org-slug">{found.email}</span>
        </div>
      ) : found === null ? (
        <p className="hc-field-error">{t('team:add.notFound')}</p>
      ) : null}
    </Modal>
  );
}
