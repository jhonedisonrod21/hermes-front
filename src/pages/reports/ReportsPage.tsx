import { useEffect, useState } from 'react';
import { BarChart3, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { Button, Card, TextField } from '../../components/ui';
import { useToast } from '../../components/feedback/toast';
import { reportsApi } from '../../api/services';

function monthStartISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Kind = 'sales' | 'statistics';

export function ReportsPage() {
  const { t } = useTranslation(['reports', 'common']);
  const toast = useToast();
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());
  const [busy, setBusy] = useState<Kind | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);

  // Libera la URL de objeto del PDF anterior (al reemplazarlo o al desmontar).
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  async function show(kind: Kind) {
    if (from && to && from > to) {
      toast.error(t('reports:invalidRange'));
      return;
    }
    setBusy(kind);
    try {
      const blob = await (kind === 'sales' ? reportsApi.salesBlob(from, to) : reportsApi.statisticsBlob(from, to));
      const url = URL.createObjectURL(blob);
      const name = `${kind === 'sales' ? 'ventas' : 'estadisticas'}-${from}_${to}.pdf`;
      setPreview({ url, name });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page">
      <PageHeader eyebrow={t('reports:eyebrow')} title={t('reports:title')} description={t('reports:description')} />

      <Card className="panel form-panel">
        <div className="hc-form-row">
          <TextField label={t('reports:from')} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <TextField label={t('reports:to')} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <p className="account-hint">{t('reports:rangeHint')}</p>
        <div className="panel-actions">
          <Button icon={<FileText size={17} />} disabled={busy !== null} onClick={() => show('sales')}>
            {busy === 'sales' ? t('reports:generating') : t('reports:viewSales')}
          </Button>
          <Button
            variant="secondary"
            icon={<BarChart3 size={17} />}
            disabled={busy !== null}
            onClick={() => show('statistics')}
          >
            {busy === 'statistics' ? t('reports:generating') : t('reports:viewStats')}
          </Button>
        </div>
      </Card>

      {preview ? (
        <Card className="panel report-preview-panel">
          <div className="report-preview-head">
            <span className="hc-field-label">{t('reports:previewTitle')}</span>
            <a className="hc-button hc-button-ghost hc-button-sm" href={preview.url} download={preview.name}>
              <span className="hc-button-icon"><Download size={15} /></span>
              <span>{t('reports:download')}</span>
            </a>
          </div>
          <iframe className="report-preview" src={preview.url} title={t('reports:previewTitle')} />
        </Card>
      ) : null}
    </div>
  );
}
