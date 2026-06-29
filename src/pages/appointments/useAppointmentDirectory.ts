import { useCallback, useMemo } from 'react';
import { useResource } from '../../hooks/useResource';
import { catalogApi, identityApi } from '../../api/services';
import type { AppointmentResponse } from '../../api/types';

/**
 * Resuelve, para un conjunto de citas, los datos legibles que las vistas y los modales necesitan:
 * nombre del servicio, etiqueta de cada requisito y ficha del cliente. Centraliza la lógica que antes
 * vivía en AppointmentsPage para que tanto la vista lista como la vista calendario la compartan.
 *
 * - El nombre/requisitos del servicio salen del detalle público de la oferta (/catalog/search/{id}),
 *   accesible a TENANT_ADMIN y TENANT_PARTNER (el listado administrativo no lo es para el colaborador).
 * - El contacto del cliente se resuelve en lote desde el directorio del tenant (máx. 100 ids por lote).
 */
export function useAppointmentDirectory(items: AppointmentResponse[]) {
  const offeringIdsKey = useMemo(
    () => [...new Set(items.map((a) => a.offeringId))].sort().join(','),
    [items]
  );
  const offerings = useResource(
    () =>
      Promise.all(
        (offeringIdsKey ? offeringIdsKey.split(',') : []).map((id) =>
          catalogApi.getPublicOffering(id).catch(() => null)
        )
      ),
    [offeringIdsKey]
  );
  const offeringName = useMemo(() => {
    const map = new Map((offerings.data ?? []).filter(Boolean).map((o) => [o!.id, o!.name]));
    return (id: string) => map.get(id) ?? id.slice(0, 8);
  }, [offerings.data]);

  const requirementLabel = useMemo(() => {
    const byOffering = new Map(
      (offerings.data ?? [])
        .filter(Boolean)
        .map((o) => [o!.id, new Map((o!.requirements ?? []).map((r) => [r.key, r.label]))])
    );
    return (offeringId: string, key: string) => byOffering.get(offeringId)?.get(key) ?? key;
  }, [offerings.data]);

  // Tipo de cada requisito (TEXT/NUMBER/DATE/BOOLEAN/FILE): permite distinguir los anexos de archivo
  // y ofrecer su descarga en lugar de mostrar el valor como texto.
  const requirementType = useMemo(() => {
    const byOffering = new Map(
      (offerings.data ?? [])
        .filter(Boolean)
        .map((o) => [o!.id, new Map((o!.requirements ?? []).map((r) => [r.key, r.type]))])
    );
    return (offeringId: string, key: string) => byOffering.get(offeringId)?.get(key);
  }, [offerings.data]);

  const customerIdsKey = useMemo(
    () => [...new Set(items.map((a) => a.customerUserId))].sort().join(','),
    [items]
  );
  const customers = useResource(
    () => (customerIdsKey ? identityApi.getUserCards(customerIdsKey.split(',').slice(0, 100)) : Promise.resolve([])),
    [customerIdsKey]
  );
  const customerCard = useMemo(() => {
    const map = new Map((customers.data ?? []).map((c) => [c.id, c]));
    return (id: string) => map.get(id);
  }, [customers.data]);
  const customerLabel = useCallback(
    (a: AppointmentResponse) => {
      const c = customerCard(a.customerUserId);
      return c?.name || c?.email || c?.username || `${a.customerUserId.slice(0, 8)}…`;
    },
    [customerCard]
  );

  return { offeringName, requirementLabel, requirementType, customerCard, customerLabel };
}
