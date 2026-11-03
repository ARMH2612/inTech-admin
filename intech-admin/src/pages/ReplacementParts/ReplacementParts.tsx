import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
const createFields = [{ name: 'title_fr', label: 'Nom (français)', required: true }, { name: 'title_ar', label: 'Nom (arabe)', required: true }, { name: 'applies_to_all', label: 'Applicable à tous les appareils', type: 'checkbox' as const, defaultValue: true, help: 'Décochez cette option pour limiter la pièce aux IDs d’appareils indiqués.' }, { name: 'device_product_ids', label: 'IDs des appareils concernés', type: 'id-list' as const, help: 'IDs séparés par des virgules.' }];
const editFields = [...createFields.slice(0, 3), createFields[3], { name: 'is_active', label: 'Actif', type: 'checkbox' as const }];
export function ReplacementParts(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Pièces de rechange' });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'pièce de rechange', refresh: data.refresh, create: { method: 'POST', path: '/admin/replacement-parts', fields: createFields }, update: { method: 'PUT', path: item => `/admin/replacement-parts/${item.id}`, fields: editFields }, remove: { method: 'DELETE', path: item => `/admin/replacement-parts/${item.id}` } });
  const columns = [{ key: 'Pièce', label: 'PIÈCE' }, { key: 'Nom arabe', label: 'NOM ARABE' }, { key: 'Appareils', label: 'APPAREILS COMPATIBLES' }, { key: 'Ordre', label: 'ORDRE' }, { key: 'Statut', label: 'STATUT', status: true }];
  return <>{mutations.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onCreate={mutations.create} onEdit={mutations.edit} onDelete={mutations.remove} notice={mutations.notice} emptyMessage="Aucune pièce de rechange." /></>;
}




