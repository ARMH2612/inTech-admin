import { Activity, ArrowDownUp, ClipboardList, RefreshCw, Users } from 'lucide-react';
import { Metric, RequestTable } from '../../components';
import { rowToRequest } from '../../config/api';
import { usePageData } from '../../hooks';
import type { ScreenPageProps } from '../../types/page';

export function Dashboard(props: ScreenPageProps) {
  const { visibleRows, meta, loading, error, refresh } = usePageData({ ...props, page: 'Vue d’ensemble' });
  if (loading) return <div className="panel api-state"><RefreshCw className="spin" size={20} /><b>Chargement des données sécurisées…</b><span>Lecture de l’API InTech</span></div>;
  if (error) return <div className="panel api-error-state"><h2>Impossible de charger la vue d’ensemble</h2><p>{error}</p><button className="button subtle" onClick={refresh}><RefreshCw size={15} />Réessayer</button></div>;
  return <>
    <div className="overview-controls"><button className="button subtle" onClick={refresh}><RefreshCw size={15} />Actualiser</button></div>
    <section className="metric-grid">
      <Metric icon={ClipboardList} label="Demandes enregistrées" value={meta?.total ?? '—'} detail="Total renvoyé par l’API" tone="lavender" />
      <Metric icon={ArrowDownUp} label="À attribuer" value={meta?.unassigned ?? '—'} detail="File non attribuée" tone="sand" />
      <Metric icon={Users} label="Techniciens" value={meta?.technicians ?? '—'} detail="Réseau enregistré" tone="blue" />
      <Metric icon={Activity} label="Connexion" value="Active" detail="Session administrateur" tone="rose" />
    </section>
    <RequestTable data={visibleRows.slice(0, 8).map(rowToRequest)} onSelect={request => { const row = visibleRows.find(item => item.Référence === request.id); if (row) props.onSelect(row); }} />
  </>;
}



