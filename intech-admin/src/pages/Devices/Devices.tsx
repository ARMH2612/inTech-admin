import { CustomTable } from '../../components';
import { usePageData, useApiMutations } from '../../hooks';
import type { MutationField } from '../../components/MutationDrawer';
import type { ScreenPageProps } from '../../types/page';

const deviceFields: MutationField[] = [
  { name: 'name_fr', label: 'Nom en français', required: true },
  { name: 'name_ar', label: 'Nom en arabe', required: true },
  { name: 'device_key', label: 'Clé technique', required: true, help: 'Ex. appliance_fridge' },
  { name: 'eligible_for_gaz', label: 'Éligible aux interventions gaz', type: 'checkbox' },
  { name: 'is_active', label: 'Actif dans l’application', type: 'checkbox', defaultValue: true },
];

export function Devices(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Appareils' });
  const actions = useApiMutations({
    base: props.base, token: props.token, title: 'Appareil', refresh: data.refresh,
    create: { method: 'POST', path: '/admin/device-products', fields: deviceFields },
    update: { method: 'PUT', path: item => `/admin/device-products/${item.id}`, fields: deviceFields },
    remove: { method: 'DELETE', path: item => `/admin/device-products/${item.id}` },
  });
  const columns = [{ key: 'Appareil', label: 'APPAREIL' }, { key: 'Clé', label: 'CLÉ' }, { key: 'Gaz', label: 'ÉLIGIBLE GAZ' }, { key: 'Statut', label: 'STATUT', status: true }, { key: 'Ordre', label: 'ORDRE' }];
  return <>{<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} emptyMessage="Aucun appareil configuré." onCreate={actions.create} onEdit={actions.edit} onDelete={actions.remove} notice={actions.notice} />}{actions.drawer}</>;
}
