import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
const createFields = [
  { name: 'title_fr', label: 'Titre (français)', required: true }, { name: 'title_ar', label: 'Titre (arabe)', required: true },
  { name: 'reparation_type', label: 'Type de réparation', type: 'select' as const, required: true, options: [{ label: 'À domicile', value: 'domicile' }, { label: 'Climatisation', value: 'ac' }] },
  { name: 'input_type', label: 'Type de saisie', type: 'select' as const, options: ['none', 'text', 'number', 'parts_list'].map(value => ({ label: value, value })) },
  { name: 'allows_multiple', label: 'Autoriser plusieurs choix', type: 'checkbox' as const }, { name: 'is_other', label: 'Option « Autre »', type: 'checkbox' as const },
];
const editFields = [
  { name: 'title_fr', label: 'Titre (français)' }, { name: 'title_ar', label: 'Titre (arabe)' },
  { name: 'input_type', label: 'Type de saisie', type: 'select' as const, options: ['none', 'text', 'number', 'parts_list'].map(value => ({ label: value, value })) },
  { name: 'allows_multiple', label: 'Autoriser plusieurs choix', type: 'checkbox' as const }, { name: 'is_other', label: 'Option « Autre »', type: 'checkbox' as const }, { name: 'is_active', label: 'Actif', type: 'checkbox' as const },
];
export function Prestations(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Prestations' });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'prestation', refresh: data.refresh,
    create: { method: 'POST', path: '/admin/prestation-options', fields: createFields }, update: { method: 'PUT', path: item => `/admin/prestation-options/${item.id}`, fields: editFields }, remove: { method: 'DELETE', path: item => `/admin/prestation-options/${item.id}` } });
  const columns = [{ key: 'Prestation', label: 'PRESTATION' }, { key: 'Type', label: 'TYPE' }, { key: 'Articles liés', label: 'ARTICLES LIÉS' }, { key: 'Type de saisie', label: 'TYPE DE SAISIE' }, { key: 'Statut', label: 'STATUT', status: true }];
  return <>{mutations.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onCreate={mutations.create} onEdit={mutations.edit} onDelete={mutations.remove} notice={mutations.notice} emptyMessage="Aucune prestation configurée." /></>;
}




