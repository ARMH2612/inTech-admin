import { CustomTable } from '../../components';
import { useApiMutations, usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';
export function WilayaPrices(props: ScreenPageProps) {
  const data = usePageData({ ...props, page: 'Prix par wilaya' });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'tarif wilaya', refresh: data.refresh, update: { method: 'PUT', path: '/admin/wilaya-prices', fields: [
    { name: 'domicile_price', label: 'Tarif à domicile (DA)', type: 'number', min: 0, step: 0.01 }, { name: 'ac_price', label: 'Tarif climatisation (DA)', type: 'number', min: 0, step: 0.01 }, { name: 'inspection_fee', label: 'Frais d’inspection (DA)', type: 'number', min: 0, step: 0.01 },
  ], payload: (values, item) => ({ prices: [{ id: item?.id, domicile_price: Number(values.domicile_price), ac_price: Number(values.ac_price), inspection_fee: Number(values.inspection_fee) }] }), successMessage: 'Tarifs de la wilaya mis à jour.' } });
  const columns = [{ key: 'Wilaya', label: 'WILAYA' }, { key: 'À domicile', label: 'RÉPARATION À DOMICILE' }, { key: 'Climatisation', label: 'CLIMATISATION' }, { key: 'Frais d’inspection', label: 'FRAIS D’INSPECTION' }];
  return <>{mutations.drawer}<CustomTable columns={columns} rows={data.visibleRows} total={data.meta?.total} loading={data.loading} error={data.error} onRefresh={data.refresh} onEdit={mutations.edit} notice={mutations.notice} emptyMessage="Aucun tarif wilaya configuré." /></>;
}




