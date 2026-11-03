import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
const fields = [{ name: 'name', label: 'Nom du produit', required: true }, { name: 'reference', label: 'Référence' }, { name: 'description', label: 'Description', type: 'textarea' as const }, { name: 'price', label: 'Prix (DA)', type: 'number' as const, required: true, min: 0, step: 0.01 }, { name: 'stock', label: 'Stock', type: 'number' as const, min: 0, step: 1 }, { name: 'shop_category_id', label: 'ID catégorie', type: 'number' as const, min: 1 }, { name: 'shop_brand_id', label: 'ID marque (admin)', type: 'number' as const, min: 1 }, { name: 'is_active', label: 'Actif', type: 'checkbox' as const, defaultValue: true }, { name: 'image', label: 'Image', type: 'file' as const }];
export function Products(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Produits' });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'produit', refresh: data.refresh, create: { method: 'POST', path: '/admin/shop/products', fields }, update: { method: 'POST', path: item => `/admin/shop/products/${item.id}`, fields }, remove: { method: 'DELETE', path: item => `/admin/shop/products/${item.id}` } });
  const columns = [{ key: 'Produit', label: 'PRODUIT' }, { key: 'Référence', label: 'RÉFÉRENCE' }, { key: 'Catégorie', label: 'CATÉGORIE' }, { key: 'Prix', label: 'PRIX' }, { key: 'Stock', label: 'STOCK' }, { key: 'Statut', label: 'STATUT', status: true }];
  return <>{mutations.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onCreate={mutations.create} onEdit={mutations.edit} onDelete={mutations.remove} notice={mutations.notice} emptyMessage="Aucun produit en boutique." /></>;
}




