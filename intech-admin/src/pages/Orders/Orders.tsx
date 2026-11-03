import { CustomTable } from "../../components";
import { useApiMutations, usePageData } from "../../hooks";
import type { ScreenPageProps } from "../../types/page";
export function Orders(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: "Commandes" });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'commande', refresh: data.refresh,
    update: { method: 'PUT', path: item => `/admin/shop/orders/${item.id}/status`, fields: [
      { name: 'status', label: 'Nouveau statut', type: 'select', required: true, options: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(value => ({ label: value, value })) },
      { name: 'admin_note', label: 'Note interne', type: 'textarea' },
    ], successMessage: 'Statut de la commande mis à jour.' } });
  const columns = [
    { key: "Commande", label: "COMMANDE" },
    { key: "Client", label: "CLIENT" },
    { key: "Total", label: "TOTAL" },
    { key: "Statut", label: "STATUT", status: true },
    { key: "Date", label: "PASSÉE LE" },
  ];
  return (
    <>{mutations.drawer}<CustomTable
      columns={columns}
      rows={data.visibleRows}
      total={data.meta?.total}
      loading={data.loading}
      error={data.error}
      onRefresh={data.refresh}
      onEdit={mutations.edit}
      notice={mutations.notice}
      emptyMessage="Aucune commande trouvée."
    /></>
  );
}
