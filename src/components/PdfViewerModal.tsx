import { useEffect, useRef, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './ui';
import { useToast } from './feedback/toast';
import { ApiError } from '../api/http';

type Props = {
  /** Diálogo abierto. Al pasar a true se carga el PDF con `load`. */
  open: boolean;
  /** Título del diálogo. */
  title: string;
  /** Nombre sugerido para la descarga (p. ej. "anexo.pdf"). */
  fileName: string;
  /** Trae el PDF como Blob (se invoca al abrir). */
  load: () => Promise<Blob>;
  onClose: () => void;
};

/**
 * Visor de PDF reutilizable: muestra el documento embebido y ofrece descargarlo e imprimirlo. Mismo
 * patrón que el visor de reportes/comprobantes (iframe + impresión vía contentWindow.print()).
 */
export function PdfViewerModal({ open, title, fileName, load, onClose }: Props) {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [doc, setDoc] = useState<{ url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Carga el PDF al abrir; libera la object URL al cerrar/cambiar o desmontar.
  useEffect(() => {
    if (!open) return undefined;
    let url: string | null = null;
    let active = true;
    setLoading(true);
    load()
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setDoc({ url });
      })
      .catch((err) => {
        if (!active) return;
        // Mensaje localizado: el cuerpo del backend (p. ej. "Attachment not found") no es i18n.
        const notFound = err instanceof ApiError && err.status === 404;
        toast.error(t(notFound ? 'pdfViewer.notFound' : 'pdfViewer.error'));
        onClose();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
      setDoc(null);
    };
    // Solo re-ejecuta al abrir/cerrar: `load` se pasa inline y no debe disparar recargas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function printPdf() {
    iframeRef.current?.contentWindow?.print();
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      className="hc-modal-wide"
      footer={
        doc ? (
          <>
            <a className="hc-button hc-button-secondary hc-button-md" href={doc.url} download={fileName}>
              <span className="hc-button-icon"><Download size={16} /></span>
              <span>{t('pdfViewer.download')}</span>
            </a>
            <Button icon={<Printer size={16} />} onClick={printPdf}>{t('pdfViewer.print')}</Button>
          </>
        ) : null
      }
    >
      {loading && !doc ? <p className="report-loading">{t('pdfViewer.loading')}</p> : null}
      {doc ? <iframe ref={iframeRef} className="report-viewer" src={doc.url} title={title} /> : null}
    </Modal>
  );
}
