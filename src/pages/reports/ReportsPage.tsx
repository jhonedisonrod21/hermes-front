import { useState } from 'react';
import { BarChart3, FileText, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { ReportModal, type ReportKind } from './ReportModal';

export function ReportsPage() {
  const { t } = useTranslation(['reports', 'common']);
  const [open, setOpen] = useState<ReportKind | null>(null);

  return (
    <div className="page">
      <PageHeader eyebrow={t('reports:eyebrow')} title={t('reports:title')} description={t('reports:description')} />

      <div className="report-grid">
        <button type="button" className="report-tile" onClick={() => setOpen('statistics')}>
          <span className="report-tile-icon"><BarChart3 size={24} /></span>
          <strong>{t('reports:stats.title')}</strong>
          <span className="report-tile-desc">{t('reports:stats.desc')}</span>
        </button>

        <button type="button" className="report-tile" onClick={() => setOpen('sales')}>
          <span className="report-tile-icon"><FileText size={24} /></span>
          <strong>{t('reports:sales.title')}</strong>
          <span className="report-tile-desc">{t('reports:sales.desc')}</span>
        </button>

        <button type="button" className="report-tile" disabled>
          <span className="report-tile-icon"><Sparkles size={24} /></span>
          <strong>{t('reports:custom.title')}</strong>
          <span className="report-tile-desc">{t('reports:custom.desc')}</span>
        </button>
      </div>

      <ReportModal key={open ?? 'closed'} kind={open} onClose={() => setOpen(null)} />
    </div>
  );
}
