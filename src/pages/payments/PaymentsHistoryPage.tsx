import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { PaymentsList } from './PaymentsList';
import { paymentApi, reportsApi } from '../../api/services';

/** Historial de transacciones (pagos recibidos) del establecimiento. */
export function PaymentsHistoryPage() {
  const { t } = useTranslation(['payments', 'common']);
  const [total, setTotal] = useState(0);
  const [shown, setShown] = useState(0);

  return (
    <div className="page">
      <PageHeader
        title={t('payments:historyTitle')}
        description={t('payments:historyDescription')}
        tools={
          <>
            <span className="table-toolbar-count">{t('common:pagination.items', { count: total })}</span>
            {total > shown ? (
              <span className="table-toolbar-hint">{t('payments:history.showingLatest', { count: shown })}</span>
            ) : null}
          </>
        }
      />

      <PaymentsList
        showToolbar={false}
        onTotal={(t2, s) => {
          setTotal(t2);
          setShown(s);
        }}
        loader={() => paymentApi.listReceivedPayments({ size: 50, sort: 'createdAt,desc' })}
        receiptLoader={reportsApi.receiptBlob}
      />
    </div>
  );
}
