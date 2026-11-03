import { RefreshCw, Pencil } from 'lucide-react';
import { useApiMutations } from '../../hooks';
import { usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';

export function Settings(props: ScreenPageProps) {
  const { settings, loading, error, refresh } = usePageData({ ...props, page: 'Réglages' });
  const mutations = useApiMutations({ base: props.base, token: props.token, title: 'réglages', refresh, update: { method: 'PUT', path: '/admin/settings', fields: [
    { name: 'domicile_recommended_price', label: 'Prix recommandé à domicile (DA)', type: 'number', required: true, min: 0, step: 0.01 },
    { name: 'ac_recommended_price', label: 'Prix recommandé climatisation (DA)', type: 'number', required: true, min: 0, step: 0.01 },
    { name: 'assignment_mode', label: 'Mode d’assignation', type: 'select', options: [{ label: 'Automatique', value: 'auto' }, { label: 'Manuel', value: 'manual' }] },
    { name: 'radius_filtering_enabled', label: 'Filtrage par rayon actif', type: 'checkbox' },
    { name: 'points_per_completed_request', label: 'Points par demande terminée', type: 'number', min: 1 },
    { name: 'support_whatsapp_number', label: 'WhatsApp assistance' },
    { name: 'referral_points_per_milestone', label: 'Points par étape de parrainage', type: 'number', min: 0 },
  ], successMessage: 'Réglages enregistrés.' } });
  if (loading) return <div className="panel api-state"><RefreshCw className="spin" size={20} /><b>Chargement des paramètres…</b></div>;
  if (error) return <div className="panel api-error-state"><h2>Impossible de charger les réglages</h2><p>{error}</p><button className="button subtle" onClick={refresh}><RefreshCw size={15} />Réessayer</button></div>;
  return <><section className="panel api-settings"><div className="panel-head"><div><h2>Paramètres de service</h2><p>Prix, affectation, assistance et règles de points.</p></div><div className="data-table-actions"><button className="button subtle" onClick={refresh}><RefreshCw size={15} />Actualiser</button><button className="button primary" onClick={() => mutations.editRecord?.(settings || {})}><Pencil size={15} />Modifier</button></div></div>{mutations.notice && <div className="mutation-notice" role="status">{mutations.notice}</div>}<div className="api-setting-grid">{Object.entries(settings || {}).map(([key, value]) => <div key={key}><span>{key.replaceAll('_', ' ')}</span><b>{typeof value === 'boolean' ? value ? 'Activé' : 'Désactivé' : String(value ?? '—')}</b></div>)}</div></section>{mutations.drawer}</>;
}



