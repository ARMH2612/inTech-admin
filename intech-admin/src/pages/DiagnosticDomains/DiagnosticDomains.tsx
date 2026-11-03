import { CustomTable } from '../../components';
import { usePageData, useApiMutations } from '../../hooks';
import type { MutationField } from '../../components/MutationDrawer';
import type { ScreenPageProps } from '../../types/page';

const domainFields: MutationField[] = [
  { name: 'name_fr', label: 'Nom en français', required: true }, { name: 'name_ar', label: 'Nom en arabe', required: true },
  { name: 'description_fr', label: 'Description en français' }, { name: 'description_ar', label: 'Description en arabe' },
  { name: 'is_other', label: 'Domaine « Autre »', type: 'checkbox' }, { name: 'is_active', label: 'Actif dans l’application', type: 'checkbox', defaultValue: true },
];

export function DiagnosticDomains(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Domaines de diagnostic' });
  const actions = useApiMutations({ base: props.base, token: props.token, title: 'Domaine de diagnostic', refresh: data.refresh,
    create: { method: 'POST', path: '/admin/diagnostic-domains', fields: domainFields },
    update: { method: 'PUT', path: item => `/admin/diagnostic-domains/${item.id}`, fields: domainFields },
    remove: { method: 'DELETE', path: item => `/admin/diagnostic-domains/${item.id}` },
  });
  const columns = [{ key: 'Domaine', label: 'DOMAINE' }, { key: 'Description', label: 'DESCRIPTION' }, { key: 'Pannes', label: 'PANNES' }, { key: 'Statut', label: 'STATUT', status: true }, { key: 'Ordre', label: 'ORDRE' }];
  return <><CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} emptyMessage="Aucun domaine de diagnostic configuré." onCreate={actions.create} onEdit={actions.edit} onDelete={actions.remove} notice={actions.notice} />{actions.drawer}</>;
}
