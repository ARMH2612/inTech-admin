import { CustomTable } from "../../components";
import { useApiCommand, useApiMutations, usePageData } from "../../hooks";
import type { ScreenPageProps } from "../../types/page";
export function Administrators(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: "Administrateurs" });
  const command = useApiCommand(props.base, props.token, data.refresh);
  const sections = ['requests','clients','technicians','assignments','settings','wilaya_prices','prestation_options','diagnostic_domains','device_products','packages','promo_codes','spare_parts_shops','shop'];
  const actions = useApiMutations({ base: props.base, token: props.token, title: 'administrateur', refresh: data.refresh,
    create: { method: 'POST', path: '/admin/admins', fields: [
      { name: 'first_name', label: 'Prénom', required: true }, { name: 'last_name', label: 'Nom', required: true }, { name: 'email', label: 'Email', required: true }, { name: 'password', label: 'Mot de passe initial (optionnel)', type: 'password' },
      { name: 'role', label: 'Rôle', type: 'select', options: [{ label: 'Administrateur', value: 'admin' }, { label: 'Propriétaire de marque', value: 'brand_owner' }] },
      { name: 'permissions', label: `Autorisations (une par ligne) · ${sections.join(', ')}`, type: 'lines', help: 'Pour un propriétaire de marque, l’API force automatiquement l’autorisation shop.' },
    ] },
    update: { method: 'PUT', path: item => `/admin/admins/${item.id}/permissions`, fields: [{ name: 'admin_permissions', label: 'Autorisations (une par ligne)', type: 'lines', help: `Valeurs possibles : ${sections.join(', ')}` }], payload: values => ({ permissions: String(values.admin_permissions || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean) }) },
    remove: { method: 'DELETE', path: item => `/admin/admins/${item.id}` },
  });
  const columns = [
    { key: "Administrateur", label: "ADMINISTRATEUR" },
    { key: "Email", label: "EMAIL" },
    { key: "Rôle", label: "RÔLE" },
    { key: "Sections", label: "AUTORISATIONS" },
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
      onCreate={actions.create}
      onEdit={actions.edit}
      canEdit={row => row.Rôle === 'admin'}
      onDelete={actions.remove}
      notice={actions.notice}
      mutationError={command.error}
      rowActions={row => <button type="button" className="button subtle table-inline-action" disabled={command.busy} onClick={() => void command.run(`/admin/admins/${row._id}/${row.Statut === 'Bloqué' ? 'unblock' : 'block'}`, 'POST', undefined, row.Statut === 'Bloqué' ? 'Administrateur débloqué.' : 'Administrateur bloqué.')}>{row.Statut === 'Bloqué' ? 'Débloquer' : 'Bloquer'}</button>}
      emptyMessage="Aucun administrateur trouvé."
    />
    {actions.drawer}
    </>
  );
}



