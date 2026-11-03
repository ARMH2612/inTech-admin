import { CustomTable } from '../../components';
import { useApiCommand, useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
export function Technicians(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Techniciens' });
  const command = useApiCommand(props.base, props.token, data.refresh);
  const pointActions = useApiMutations({ base: props.base, token: props.token, title: 'points technicien', refresh: data.refresh, update: { method: 'POST', path: item => `/admin/technicians/${item.id}/points`, fields: [{ name: 'points', label: 'Solde de points', type: 'number', required: true, min: 0, step: 1 }] } });
  const approveActions = useApiMutations({ base: props.base, token: props.token, title: 'approbation technicien', refresh: data.refresh, update: { method: 'POST', path: item => `/admin/technicians/${item.id}/approve`, fields: [{ name: 'is_points_based', label: 'Fonctionne avec les points', type: 'checkbox', defaultValue: true }], payload: values => ({ is_points_based: Boolean(values.is_points_based) }), successMessage: 'Inscription technicien approuvée.' } });
  const rejectActions = useApiMutations({ base: props.base, token: props.token, title: 'refus d’inscription', refresh: data.refresh, update: { method: 'POST', path: item => `/admin/technicians/${item.id}/reject`, fields: [{ name: 'reason', label: 'Motif (optionnel)', type: 'textarea' }], payload: values => ({ reason: values.reason }), successMessage: 'Inscription technicien refusée.' } });
  const actions = useApiMutations({ base: props.base, token: props.token, title: 'technicien', refresh: data.refresh,
    create: { method: 'POST', path: '/admin/technicians', fields: [
      { name: 'first_name', label: 'Prénom', required: true }, { name: 'last_name', label: 'Nom', required: true }, { name: 'phone_number', label: 'Téléphone', required: true }, { name: 'email', label: 'Email' }, { name: 'password', label: 'Mot de passe (si email)' },
      { name: 'language', label: 'Langue', type: 'select', options: [{ label: 'Français', value: 'fr' }, { label: 'Arabe', value: 'ar' }] },
      { name: 'technician_type', label: 'Profil', type: 'select', required: true, options: ['technician', 'workshop', 'ac', 'electronic'].map(value => ({ label: value, value })) },
      { name: 'years_of_experience', label: 'Années d’expérience' }, { name: 'fields', label: 'Domaines (un par ligne)', type: 'lines' }, { name: 'devices', label: 'Clés appareils (une par ligne)', type: 'lines' },
      { name: 'is_points_based', label: 'Fonctionne avec des points', type: 'checkbox', defaultValue: true }, { name: 'latitude', label: 'Latitude', type: 'number', step: 0.000001, help: 'Requis sauf pour un atelier.' }, { name: 'longitude', label: 'Longitude', type: 'number', step: 0.000001, help: 'Requis sauf pour un atelier.' }, { name: 'radius', label: 'Rayon d’intervention (km)', type: 'number', min: 0.1, step: 0.1 },
    ] } });
  const columns = [{ key: 'Technicien', label: 'TECHNICIEN' }, { key: 'Type', label: 'TYPE' }, { key: 'Spécialités', label: 'SPÉCIALITÉS' }, { key: 'Statut', label: 'STATUT', status: true }, { key: 'Disponible', label: 'DISPONIBLE' }, { key: 'Note', label: 'NOTE' }];
  return <>{actions.drawer}{pointActions.drawer}{approveActions.drawer}{rejectActions.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onCreate={actions.create} onEdit={pointActions.edit} editLabel="Modifier le solde de points" notice={actions.notice || pointActions.notice || approveActions.notice || rejectActions.notice || command.notice} mutationError={command.error} rowActions={row => row.Statut === 'pending' || row.Statut === 'Pending' ? <><button type="button" className="button subtle table-inline-action" onClick={() => approveActions.edit?.(row)}>Approuver</button><button type="button" className="button subtle table-inline-action" onClick={() => rejectActions.edit?.(row)}>Refuser</button></> : <button type="button" className="button subtle table-inline-action" disabled={command.busy} onClick={() => void command.run(`/admin/technicians/${row._id}/${row.Statut === 'Bloqué' ? 'unblock' : 'block'}`, 'POST', undefined, row.Statut === 'Bloqué' ? 'Technicien débloqué.' : 'Technicien bloqué.')}>{row.Statut === 'Bloqué' ? 'Débloquer' : 'Bloquer'}</button>} emptyMessage="Aucun technicien trouvé." /></>;
}




