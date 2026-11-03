import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
export function PackageRequests(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Demandes forfaits' });
  const confirm = useApiMutations({ base: props.base, token: props.token, title: 'confirmation du paiement', refresh: data.refresh, update: { method: 'POST', path: item => `/admin/technicians/${item.technician_id}/assign-package`, fields: [{ name: 'admin_note', label: 'Note interne (optionnelle)', type: 'textarea' }], payload: (values, item) => ({ purchase_id: item?.id, admin_note: values.admin_note }), successMessage: 'Paiement confirmé et forfait attribué.' } });
  const reject = useApiMutations({ base: props.base, token: props.token, title: 'refus de la demande de forfait', refresh: data.refresh, update: { method: 'POST', path: item => `/admin/technicians/${item.technician_id}/reject-package-request`, fields: [{ name: 'admin_note', label: 'Motif du refus (optionnel)', type: 'textarea' }], payload: (values, item) => ({ purchase_id: item?.id, admin_note: values.admin_note }), successMessage: 'Demande de forfait refusée.' } });
  const columns = [{ key: 'Technicien', label: 'TECHNICIEN' }, { key: 'Forfait', label: 'FORFAIT' }, { key: 'Montant', label: 'MONTANT' }, { key: 'Paiement', label: 'PAIEMENT' }, { key: 'Statut', label: 'STATUT', status: true }, { key: 'Créée', label: 'DEMANDÉ LE' }];
  return <>{confirm.drawer}{reject.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onEdit={confirm.edit} editLabel="Confirmer le paiement" notice={confirm.notice || reject.notice} rowActions={row => <button type="button" className="button subtle table-inline-action" onClick={() => reject.edit?.(row)}>Refuser</button>} emptyMessage="Aucune demande de forfait." /></>;
}




