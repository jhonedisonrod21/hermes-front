import { useState, type FormEvent, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Props = {
  /** Destino del logotipo. Landing e invitado: "/" (la cara pública). */
  to?: string;
  /** Acciones a la derecha: en la landing los botones de acceso/registro; al invitado, su menú. */
  children?: ReactNode;
};

/**
 * Barra superior pública compartida por la landing y la experiencia del usuario invitado: mismo
 * logotipo, misma barra de búsqueda de servicios y mismo estilo (navy), con acciones distintas a la
 * derecha. La exploración de servicios vive aquí (maquetación: la búsqueda aún no dispara resultados).
 */
export function PublicTopbar({ to = '/', children }: Readonly<Props>) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Al buscar (lupa o Enter) vamos a la página de exploración con el término en la URL.
  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/explorar?q=${encodeURIComponent(term)}` : '/explorar');
  }

  return (
    <header className="public-topbar">
      <Link to={to} className="public-topbar-wordmark" aria-label="Hermes Calendar">
        <img src="/brand/hermes-logo-simple-transparent.svg" alt="" />
        <span>
          <strong>Hermes</strong>
          <em>Calendar</em>
        </span>
      </Link>

      <form className="public-search" role="search" onSubmit={onSearch}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.servicesPlaceholder')}
          aria-label={t('search.servicesPlaceholder')}
        />
        <button type="submit" className="public-search-btn" aria-label={t('search.servicesPlaceholder')}>
          <Search size={18} aria-hidden="true" />
        </button>
      </form>

      <div className="public-topbar-actions">{children}</div>
    </header>
  );
}
