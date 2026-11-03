import { CustomTable } from "../../components";
import { useApiMutations, usePageData } from "../../hooks";
import type { ScreenPageProps } from "../../types/page";
export function Assignments(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: "Assignation" });
  const actions = useApiMutations({ base: props.base, token: props.token, title: 'assignation', refresh: data.refresh,
    update: { method: 'POST', path: item => `/admin/assignments/${item.type || 'domicile'}/${item.id}/assign`, fields: [{ name: 'technician_id', label: 'ID du technicien éligible', type: 'number', required: true, min: 1, help: 'Utilisez l’identifiant du profil technicien, pas celui du compte utilisateur.' }], successMessage: 'Demande proposée au technicien. Il doit encore accepter.' } });
  const unassign = useApiMutations({ base: props.base, token: props.token, title: 'assignation', refresh: data.refresh, update: { method: 'POST', path: item => `/admin/assignments/${item.type || 'domicile'}/${item.id}/unassign`, fields: [], successMessage: 'Assignation retirée. La demande est de nouveau disponible.' } });
  const columns = [
    { key: "Référence", label: "RÉFÉRENCE" },
    { key: "Client", label: "CLIENT" },
    { key: "Appareil", label: "APPAREIL" },
    { key: "Type", label: "SERVICE", pill: true },
    { key: "Statut", label: "STATUT", status: true },
    { key: "Technicien", label: "TECHNICIEN" },
    { key: "File", label: "FILE" },
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
      onEdit={actions.edit}
      editLabel="Assigner / réassigner"
      notice={actions.notice || unassign.notice}
      rowActions={row => row.File === 'Réponse attendue' ? <button type="button" className="button subtle table-inline-action" onClick={() => unassign.edit?.(row)}>Retirer l’assignation</button> : null}
      onSelect={props.onSelect}
      rowClick={false}
      emptyMessage="Aucune demande en attente d’assignation."
    />
    {actions.drawer}
    {unassign.drawer}
    </>
  );
}
