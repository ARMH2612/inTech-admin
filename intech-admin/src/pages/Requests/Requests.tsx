import { useState } from 'react';
import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import { hasPermission } from '../../lib/access';
import { AssignTechnicianDrawer } from './components';
import type { ApiRecord, ApiRow } from '../../types';
import type { ScreenPageProps } from '../../types/page';
export function Requests(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Demandes' });
  const [assigningRow, setAssigningRow] = useState<ApiRow | null>(null);
  const [assignNotice, setAssignNotice] = useState('');
  const canDispatch = hasPermission(props.user, 'assignments');
  const actions = useApiMutations({ base: props.base, token: props.token, title: 'demande', refresh: data.refresh,
    create: { method: 'POST', path: '/admin/requests', fields: [
      { name: 'client_id', label: 'ID client', type: 'number', required: true, min: 1 },
      { name: 'reparation_type', label: 'Type', type: 'select', required: true, options: [{ label: 'À domicile', value: 'domicile' }, { label: 'Climatisation', value: 'ac' }] },
      { name: 'service_type', label: 'Offre', type: 'select', options: [{ label: 'Flexible', value: 'flexible' }, { label: 'Garanti', value: 'warranty' }, { label: 'Climatisation', value: 'ac' }] },
      { name: 'device_type', label: 'Clé appareil', help: 'Requis pour une intervention à domicile.' }, { name: 'device_model', label: 'ID du modèle' }, { name: 'problem', label: 'Identifiants de problèmes (un par ligne)', type: 'lines' }, { name: 'problem_description', label: 'Description du problème', type: 'textarea' },
      { name: 'contact_name', label: 'Nom du contact', required: true }, { name: 'contact_phone_number', label: 'Téléphone du contact', required: true }, { name: 'latitude', label: 'Latitude', type: 'number', required: true, step: 0.000001 }, { name: 'longitude', label: 'Longitude', type: 'number', required: true, step: 0.000001 }, { name: 'province', label: 'ID wilaya', type: 'number', min: 1 }, { name: 'city', label: 'Commune' }, { name: 'availability', label: 'Disponibilités' }, { name: 'promo_code', label: 'Code promo' },
    ] },
    update: { method: 'POST', path: item => `/admin/requests/${item.id}/cancel`, fields: [{ name: 'reason', label: 'Motif d’annulation', type: 'textarea', required: true }], successMessage: 'Demande annulée.' },
  });
  const columns = [
    { key: 'Référence', label: 'RÉFÉRENCE' }, { key: 'Client', label: 'CLIENT' },
    { key: 'Téléphone', label: 'TÉLÉPHONE' }, { key: 'Appareil', label: 'APPAREIL' },
    { key: 'Type', label: 'SERVICE', pill: true }, { key: 'Statut', label: 'STATUT', status: true },
    { key: 'Technicien', label: 'TECHNICIEN' }, { key: 'Créée', label: 'CRÉÉE LE' },
  ];
  function canAssign(row: ApiRow) {
    try {
      const request = row._raw ? JSON.parse(row._raw) as ApiRecord : {};
      const child = request.ac_request || request.domicile_request;
      return Boolean(child?.id && (!child.technician_id || ['pending', 'rejected'].includes(String(child.assignment_status).toLowerCase())) && !['completed', 'cancelled'].includes(String(child.status).toLowerCase()));
    } catch { return false; }
  }
  return <>{actions.drawer}{assigningRow && <AssignTechnicianDrawer base={props.base} token={props.token} row={assigningRow} onClose={() => setAssigningRow(null)} onAssigned={() => { setAssigningRow(null); setAssignNotice('Demande proposée au technicien. Il doit encore accepter.'); data.refresh(); window.setTimeout(() => setAssignNotice(''), 4500); }} />}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onSelect={props.onSelect} rowClick={false} onCreate={actions.create} onEdit={actions.edit} canEdit={row => !['Completed', 'Cancelled', 'Terminée', 'Annulée'].includes(String(row.Statut))} editLabel="Annuler la demande" viewLabel="Voir les détails et le statut" rowActions={row => canDispatch && canAssign(row) ? <button type="button" className="button subtle table-inline-action" onClick={() => setAssigningRow(row)}>{row.Technicien && row.Technicien !== 'Non assigné' ? 'Réassigner' : 'Assigner à un technicien'}</button> : null} notice={actions.notice || assignNotice} emptyMessage="Aucune demande de service." /></>;
}




