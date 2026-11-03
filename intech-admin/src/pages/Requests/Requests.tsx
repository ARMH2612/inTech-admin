import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
export function Requests(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Demandes' });
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
    { key: 'Type', label: 'SERVICE' }, { key: 'Statut', label: 'STATUT', status: true },
    { key: 'Technicien', label: 'TECHNICIEN' }, { key: 'Créée', label: 'CRÉÉE LE' },
  ];
  return <>{actions.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onSelect={props.onSelect} onCreate={actions.create} onEdit={actions.edit} editLabel="Annuler la demande" notice={actions.notice} emptyMessage="Aucune demande de service." /></>;
}




