import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type PaginationProps = {
  page: number; // base 0
  totalPages: number;
  totalElements?: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, totalElements, onChange }: Readonly<PaginationProps>) {
  const { t } = useTranslation('common');
  if (totalPages <= 1) return null;

  return (
    <div className="hc-pagination">
      <span className="hc-pagination-info">
        {t('pagination.page', { current: page + 1, total: totalPages })}
        {typeof totalElements === 'number' ? ` · ${t('pagination.items', { count: totalElements })}` : ''}
      </span>
      <div className="hc-pagination-controls">
        <button
          className="hc-icon-button"
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 0}
          aria-label={t('pagination.previous')}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="hc-icon-button"
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label={t('pagination.next')}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
