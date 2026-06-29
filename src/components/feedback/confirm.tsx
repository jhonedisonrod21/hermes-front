import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Button } from '../ui';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

export function ConfirmProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { t } = useTranslation('common');
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={options !== null}
        title={options?.title ?? ''}
        onClose={() => settle(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              {options?.cancelLabel ?? t('actions.cancel')}
            </Button>
            <Button variant={options?.danger ? 'danger' : 'primary'} onClick={() => settle(true)}>
              {options?.confirmLabel ?? t('actions.confirm')}
            </Button>
          </>
        }
      >
        <p className="confirm-message">{options?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

// El hook se coloca junto al provider a propósito (mismo dominio de feedback).
// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider.');
  }
  return context;
}
