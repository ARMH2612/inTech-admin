import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
const fields = [{ name: 'name', label: 'Nom du magasin', required: true }, { name: 'category', label: 'Catégorie', type: 'select' as const, required: true, options: [{ label: 'Électronique', value: 'electronique' }, { label: 'Mécanique', value: 'mecanique' }] }, { name: 'description', label: 'Description', type: 'textarea' as const }, { name: 'phone', label: 'Téléphone' }, { name: 'address', label: 'Adresse', required: true }, { name: 'latitude', label: 'Latitude', type: 'number' as const, required: true, min: -90, step: 0.000001 }, { name: 'longitude', label: 'Longitude', type: 'number' as const, required: true, min: -180, step: 0.000001 }, { name: 'is_open', label: 'Ouvert', type: 'checkbox' as const }, { name: 'is_active', label: 'Actif', type: 'checkbox' as const, defaultValue: true }, { name: 'cover_image', label: 'Image de couverture', type: 'file' as const }];
export function PartnerShops(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Magasins partenaires' });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'magasin partenaire', refresh: data.refresh, create: { method: 'POST', path: '/admin/spare-parts-shops', fields }, update: { method: 'POST', path: item => `/admin/spare-parts-shops/${item.id}`, fields }, remove: { method: 'DELETE', path: item => `/admin/spare-parts-shops/${item.id}` } });
  const columns = [{ key: 'Magasin', label: 'MAGASIN' }, { key: 'Catégorie', label: 'CATÉGORIE' }, { key: 'Adresse', label: 'ADRESSE' }, { key: 'Téléphone', label: 'TÉLÉPHONE' }, { key: 'Ouvert', label: 'OUVERT' }, { key: 'Statut', label: 'STATUT', status: true }];
  return <>{mutations.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onCreate={mutations.create} onEdit={mutations.edit} onDelete={mutations.remove} notice={mutations.notice} emptyMessage="Aucun magasin partenaire." /></>;
}




