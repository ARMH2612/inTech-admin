import { CustomTable } from '../../components';
import { usePageData, useApiMutations } from '../../hooks';
import type { MutationField } from '../../components/MutationDrawer';
import type { ScreenPageProps } from '../../types/page';

const packageFields: MutationField[] = [
  { name: 'name_fr', label: 'Nom en français', required: true }, { name: 'name_ar', label: 'Nom en arabe', required: true },
  { name: 'price', label: 'Prix (DA)', type: 'number', min: 0, required: true }, { name: 'points_granted', label: 'Points accordés', type: 'number', min: 1, required: true },
  { name: 'client_cap_label_fr', label: 'Libellé limite client (français)' }, { name: 'client_cap_label_ar', label: 'Libellé limite client (arabe)' },
  { name: 'savings_label_fr', label: 'Libellé économie (français)' }, { name: 'savings_label_ar', label: 'Libellé économie (arabe)' },
  { name: 'features_fr', label: 'Avantages (un par ligne, français)', type: 'lines' }, { name: 'features_ar', label: 'Avantages (un par ligne, arabe)', type: 'lines' },
  { name: 'is_featured', label: 'Mettre en avant', type: 'checkbox' }, { name: 'is_active', label: 'Actif', type: 'checkbox', defaultValue: true },
];

export function Packages(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Forfaits' });
  const actions = useApiMutations({ base: props.base, token: props.token, title: 'Forfait', refresh: data.refresh,
    create: { method: 'POST', path: '/admin/packages', fields: packageFields },
    update: { method: 'PUT', path: item => `/admin/packages/${item.id}`, fields: packageFields },
    remove: { method: 'DELETE', path: item => `/admin/packages/${item.id}` },
  });
  const columns = [{ key: 'Forfait', label: 'FORFAIT' }, { key: 'Prix', label: 'PRIX' }, { key: 'Points', label: 'POINTS' }, { key: 'Mise en avant', label: 'MISE EN AVANT' }, { key: 'Statut', label: 'STATUT', status: true }];
  return <><CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} emptyMessage="Aucun forfait configuré." onCreate={actions.create} onEdit={actions.edit} onDelete={actions.remove} notice={actions.notice} />{actions.drawer}</>;
}
