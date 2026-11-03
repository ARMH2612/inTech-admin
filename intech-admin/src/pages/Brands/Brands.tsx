import { CustomTable } from "../../components";
import { useApiMutations, usePageData } from "../../hooks";
import type { ScreenPageProps } from "../../types/page";
export function Brands(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: "Marques" });
  const owner = props.user.admin_role === 'brand_owner';
  const fields = owner
    ? [{ name: 'name', label: 'Nom', required: true }, { name: 'description', label: 'Description', type: 'textarea' as const }, { name: 'address', label: 'Adresse' }, { name: 'logo', label: 'Logo', type: 'file' as const }]
    : [{ name: 'owner_user_id', label: 'ID utilisateur propriétaire', type: 'number' as const }, { name: 'is_active', label: 'Actif', type: 'checkbox' as const }, { name: 'is_verified', label: 'Vérifié', type: 'checkbox' as const }];
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'marque', refresh: data.refresh, update: { method: 'POST', path: item => `/admin/shop/brands/${item.id}`, fields }, ...(!owner && props.user.admin_role === 'super_admin' ? { remove: { method: 'DELETE' as const, path: (item: Record<string, any>) => `/admin/shop/brands/${item.id}` } } : {}) });
  const columns = [
    { key: "Marque", label: "MARQUE" },
    { key: "Propriétaire", label: "PROPRIÉTAIRE" },
    { key: "Vérifiée", label: "VÉRIFIÉE" },
    { key: "Statut", label: "STATUT", status: true },
  ];
  return (
    <>
    <CustomTable
      columns={columns}
      rows={data.visibleRows}
      total={data.meta?.total}
      loading={data.loading}
      error={data.error}
      onRefresh={data.refresh}
      onEdit={mutations.edit}
      onDelete={mutations.remove}
      notice={mutations.notice}
      emptyMessage="Aucune marque de boutique."
    />
    {mutations.drawer}
    </>
  );
}



