import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
const fields = [{ name: 'code', label: 'Code', required: true }, { name: 'description', label: 'Description', type: 'textarea' as const }, { name: 'discount_type', label: 'Type de réduction', type: 'select' as const, required: true, options: [{ label: 'Pourcentage', value: 'percentage' }, { label: 'Montant fixe (DA)', value: 'fixed' }] }, { name: 'discount_value', label: 'Valeur', type: 'number' as const, required: true, min: 0, step: 0.01 }, { name: 'max_uses', label: 'Nombre maximum d’utilisations', type: 'number' as const, min: 1 }, { name: 'expires_at', label: 'Date d’expiration', type: 'date' as const }, { name: 'is_active', label: 'Actif', type: 'checkbox' as const, defaultValue: true }];
export function PromoCodes(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Codes promo' });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'code promo', refresh: data.refresh, create: { method: 'POST', path: '/admin/promo-codes', fields }, update: { method: 'POST', path: item => `/admin/promo-codes/${item.id}`, fields }, remove: { method: 'DELETE', path: item => `/admin/promo-codes/${item.id}` } });
  const columns = [{ key: 'Code', label: 'CODE' }, { key: 'Réduction', label: 'RÉDUCTION' }, { key: 'Utilisations', label: 'UTILISATIONS' }, { key: 'Expiration', label: 'EXPIRATION' }, { key: 'Statut', label: 'STATUT', status: true }];
  return <>{mutations.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onCreate={mutations.create} onEdit={mutations.edit} onDelete={mutations.remove} notice={mutations.notice} emptyMessage="Aucun code promotionnel." /></>;
}




