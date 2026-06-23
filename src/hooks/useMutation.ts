import { useCallback, useState } from 'react';

type MutationState = { submitting: boolean; error: Error | null };

/**
 * Encapsula una acción asíncrona (crear/editar/eliminar) con estado de envío y error.
 * `run` reenvía la promesa para que el componente decida qué hacer al resolverse.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>
): MutationState & { run: (...args: TArgs) => Promise<TResult>; reset: () => void } {
  const [state, setState] = useState<MutationState>({ submitting: false, error: null });

  const run = useCallback(
    async (...args: TArgs) => {
      setState({ submitting: true, error: null });
      try {
        const result = await action(...args);
        setState({ submitting: false, error: null });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ submitting: false, error });
        throw error;
      }
    },
    [action]
  );

  const reset = useCallback(() => setState({ submitting: false, error: null }), []);

  return { ...state, run, reset };
}
