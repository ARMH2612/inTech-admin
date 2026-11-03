import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
const fields = [{ name: 'name_fr', label: 'Nom (français)', required: true }, { name: 'name_ar', label: 'Nom (arabe)', required: true }, { name: 'is_active', label: 'Actif', type: 'checkbox' as const, defaultValue: true }, { name: 'icon', label: 'Icône', type: 'file' as const }];
export function Categories(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Catégories' });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'catégorie', refresh: data.refresh, create: { method: 'POST', path: '/admin/shop/categories', fields }, update: { method: 'POST', path: item => `/admin/shop/categories/${item.id}`, fields }, remove: { method: 'DELETE', path: item => `/admin/shop/categories/${item.id}` } });
  const columns = [{ key: 'Catégorie', label: 'CATÉGORIE' }, { key: 'Nom arabe', label: 'NOM ARABE' }, { key: 'Ordre', label: 'ORDRE' }, { key: 'Statut', label: 'STATUT', status: true }];
  return <>{mutations.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onCreate={mutations.create} onEdit={mutations.edit} onDelete={mutations.remove} notice={mutations.notice} emptyMessage="Aucune catégorie de boutique." /></>;
}




