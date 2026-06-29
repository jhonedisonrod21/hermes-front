import { useEffect, useRef, useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Button, TextField } from '../../components/ui';
import { useToast } from '../../components/feedback/toast';
import { reportsApi } from '../../api/services';

export type ReportKind = 'sales' | 'statistics';

function monthStartISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Props = {
  /** Tipo de reporte a mostrar; null = diálogo cerrado. Montar con key={kind} para reiniciar. */
  kind: ReportKind | null;
  onClose: () => void;
};

/**
 * Diálogo con visor de PDF para un reporte. Las estadísticas se generan al abrir; el informe de ventas
 * pide primero un rango de fechas. En ambos casos ofrece descargar e imprimir el PDF.
 */
export function ReportModal({ kind, onClose }: Props) {
  const { t } = useTranslation(['reports', 'common']);
  const toast = useToast();
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());
  const [doc, setDoc] = useState<{ url: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Libera la URL de objeto del PDF al reemplazarlo o al cerrar.
  useEffect(() => () => { if (doc) URL.revokeObjectURL(doc.url); }, [doc]);

  // Estadísticas de la organización: se generan de inmediato al abrir (sin selección de fechas).
  useEffect(() => {
    if (kind === 'statistics') generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  async function generate() {
    if (!kind) return;
    if (from && to && from > to) {
      toast.error(t('reports:invalidRange'));
      return;
    }
    setLoading(true);
    try {
      const blob = await (kind === 'sales' ? reportsApi.salesBlob(from, to) : reportsApi.statisticsBlob(from, to));
      const url = URL.createObjectURL(blob);
      const name = `${kind === 'sales' ? 'ventas' : 'estadisticas'}-${from}_${to}.pdf`;
      setDoc({ url, name });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setLoading(false);
    }
  }

  function printPdf() {
    iframeRef.current?.contentWindow?.print();
  }

  const title = kind === 'sales' ? t('reports:sales.title') : t('reports:stats.title');

  return (
    <Modal
      open={kind !== null}
      title={title}
      onClose={onClose}
      className="hc-modal-wide"
      footer={
        doc ? (
          <>
            <a className="hc-button hc-button-secondary hc-button-md" href={doc.url} download={doc.name}>
              <span className="hc-button-icon"><Download size={16} /></span>
              <span>{t('reports:download')}</span>
            </a>
            <Button icon={<Printer size={16} />} onClick={printPdf}>{t('reports:print')}</Button>
          </>
        ) : null
      }
    >
      {kind === 'sales' ? (
        <div className="report-range">
          <TextField label={t('reports:from')} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <TextField label={t('reports:to')} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button icon={<FileText size={16} />} onClick={generate} disabled={loading}>
            {loading ? t('reports:generating') : t('reports:generate')}
          </Button>
        </div>
      ) : null}

      {loading && !doc ? <p className="report-loading">{t('reports:generating')}</p> : null}
      {doc ? <iframe ref={iframeRef} className="report-viewer" src={doc.url} title={title} /> : null}
    </Modal>
  );
}
