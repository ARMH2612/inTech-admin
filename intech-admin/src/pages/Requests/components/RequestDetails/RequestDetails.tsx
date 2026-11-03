import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, ArrowUpRight, CalendarClock, CheckCircle2, CircleAlert, Clock3, MapPin, Phone, RefreshCw, UserRound, Wrench } from 'lucide-react';
import { apiRequest, normalizeApiBase } from '../../../../config/api';
import type { ApiRecord, RequestSummary } from '../../../../types';

interface RequestDetailsProps { base: string; token: string; id: string | number | undefined; selected: RequestSummary; canAssign: boolean; onGoAssign: () => void }
const statusNames: Record<string, string> = { Pending: 'En attente', 'Technician Assigned': 'Technicien assigné', 'On Way': 'En route', Arrived: 'Technicien arrivé', 'Diagnostic Report': 'Diagnostic en cours', 'Waiting Confirmation': 'Validation client attendue', 'Offer Rejected': 'Proposition refusée', 'Waiting Start Reparation': 'Réparation à démarrer', 'Waiting Location Confirmation': 'Confirmation du lieu attendue', 'Waiting Prestation Confirmation': 'Validation du prix attendue', 'Final Price Rejected': 'Prix final refusé', 'Waiting for technician to mark it complete': 'Finalisation technicien', Completed: 'Terminée', Cancelled: 'Annulée', 'Under Diagnostic': 'Diagnostic atelier', 'Waiting Client Confirmation': 'Validation client attendue', Ongoing: 'Réparation en cours', 'Waiting Acceptance': 'Acceptation attendue', Accepted: 'Acceptée', 'In Repair': 'Réparation en cours', 'Ready For Pickup': 'Prête à récupérer', 'Not Repairable': 'Non réparable' };
const serviceNames: Record<string, string> = { domicile: 'Réparation à domicile', ac: 'Climatisation', workshop: 'Atelier', warranty: 'Garantie' };
const dateLabel = (value: unknown) => { if (!value) return '—'; const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('fr-DZ', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Algiers' }); };
const amountLabel = (value: unknown) => value == null || value === '' ? null : `${Number(value).toLocaleString('fr-DZ')} DA`;
const fullName = (record: ApiRecord | undefined) => [record?.first_name, record?.last_name].filter(Boolean).join(' ');
const listify = (value: unknown): unknown[] => { if (Array.isArray(value)) return value; if (typeof value === 'string' && value.trim()) { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : [value]; } catch { return [value]; } } return []; };
const mediaUrl = (base: string, value: unknown) => { if (!value) return ''; try { return new URL(String(value), `${normalizeApiBase(base)}/`).toString(); } catch { return String(value); } };

function DetailSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="request-detail-section"><div className="request-detail-section-head"><span>{icon}</span><h3>{title}</h3></div>{children}</section>;
}
function DetailValue({ label, value }: { label: string; value: unknown }) {
  if (value == null || value === '') return null;
  return <div className="request-detail-value"><span>{label}</span><b>{String(value)}</b></div>;
}

export function RequestDetails({ base, token, id, selected, canAssign, onGoAssign }: RequestDetailsProps) {
  const [request, setRequest] = useState<ApiRecord | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey(value => value + 1), []);
  useEffect(() => {
    let alive = true; setRequest(null); setError('');
    if (!id) { setError('La référence API de cette demande est indisponible.'); return () => { alive = false; }; }
    apiRequest<ApiRecord>(base, token, `/admin/requests/${id}`).then(result => { if (alive) setRequest(result.request || result); }).catch(cause => { if (alive) setError(cause instanceof Error ? cause.message : String(cause)); });
    return () => { alive = false; };
  }, [base, token, id, reloadKey]);

  const item = request || {};
  const child = item.domicile_request || item.ac_request || item.workshop_request || item.warranty_claim_request || {};
  const client = item.user || {};
  const technician = child.technician || {};
  const technicianUser = technician.user || technician;
  const technicianId = technician.id ?? child.technician_id;
  const currentStatus = child.status || selected.status || '—';
  const canceled = /cancel/i.test(String(currentStatus));
  const closed = canceled || /completed/i.test(String(currentStatus));
  const statusTone = canceled ? 'cancelled' : /completed/i.test(String(currentStatus)) ? 'complete' : /pending|waiting/i.test(String(currentStatus)) ? 'waiting' : 'active';
  const explicitHistory = child.status_history || child.statusHistory || child.histories || item.status_history || item.history;
  const hasExplicitHistory = Array.isArray(explicitHistory) && explicitHistory.length > 0;
  const nextStep = closed
    ? canceled ? 'Le dossier est annulé. Consultez le motif et les dernières étapes ci-dessous.' : 'Le dossier est terminé. Consultez le diagnostic, le prix final et l’évaluation client.'
    : /waiting confirmation|waiting prestation confirmation/i.test(String(currentStatus)) ? 'La validation du client est attendue avant de poursuivre la réparation.'
    : /waiting for technician to mark it complete/i.test(String(currentStatus)) ? 'Le technicien doit confirmer la fin de l’intervention.'
    : child.assignment_status === 'pending' && technicianId ? 'La demande a été proposée au technicien. Sa réponse est encore attendue.'
    : !technicianId ? canAssign ? 'Aucun technicien n’est associé. Ouvrez Assignation pour choisir un technicien éligible.' : 'Aucun technicien n’est associé. Transmettez ce dossier à l’équipe chargée des assignations.'
    : 'Suivez l’avancement et les prochaines mises à jour du technicien.';
  const timeline = useMemo(() => {
    const explicit = explicitHistory;
    if (Array.isArray(explicit) && explicit.length) return explicit.map((event: ApiRecord) => ({ title: statusNames[event.status] || event.title || event.status || 'Mise à jour', detail: event.description || event.note || event.reason || '', date: event.created_at || event.changed_at || event.updated_at })).sort((a, b) => new Date(String(a.date || 0)).getTime() - new Date(String(b.date || 0)).getTime());
    const events: { title: string; detail?: string; date?: unknown }[] = [];
    if (item.created_at) events.push({ title: 'Demande créée', date: item.created_at });
    if (child.assigned_at) events.push({ title: 'Demande proposée à un technicien', date: child.assigned_at });
    for (const [key, title] of [['pickup_requested_at', 'Retrait de l’appareil demandé'], ['picked_up_at', 'Appareil récupéré'], ['ready_to_return_at', 'Appareil prêt au retour'], ['returned_at', 'Appareil retourné'], ['client_received_at', 'Réception confirmée'], ['device_received_at', 'Appareil reçu à l’atelier'], ['repaired_at', 'Réparation terminée'], ['handed_over_at', 'Appareil remis au client']]) if (child[key]) events.push({ title, date: child[key] });
    if (child.updated_at && child.updated_at !== item.created_at) events.push({ title: statusNames[currentStatus] || currentStatus, detail: 'Dernière étape connue dans l’API.', date: child.updated_at });
    return events.sort((a, b) => new Date(String(a.date || 0)).getTime() - new Date(String(b.date || 0)).getTime());
  }, [child, item.created_at, currentStatus, explicitHistory]);

  const location = child.location || child.address || item.location || client.location || {};
  const address = typeof location === 'string' ? location : location.full_address || location.address || location.label || location.address_line || [location.street, location.city || child.city, location.wilaya || location.province].filter(Boolean).join(', ');
  const latitude = child.latitude ?? location.latitude ?? child.current_latitude;
  const longitude = child.longitude ?? location.longitude ?? child.current_longitude;
  const media = listify(item.images || item.photos || child.images || child.completion_photos || child.pickup_photos);
  const problems = listify(item.problem).map(String);
  const prices = [['Estimation initiale', child.price_before_discount], ['Prix final client', child.client_final_price ?? child.final_price], ['Frais d’inspection', child.inspection_fee], ['Revenu technicien', child.technician_earnings], ['Coût du gaz', child.gas_cost]].filter(([, value]) => value != null && value !== '');
  const diagnostic = item.diagnostic || child.diagnostic || {};
  const review = item.review || {};
  const cancellation = item.cancellation || {};
  const workshopTransfer = item.workshop_transfer || child.workshop_transfer || {};
  const electronicTransfer = item.electronic_transfer || child.electronic_transfer || {};
  const warranty = item.warranty_claim_request || {};

  return <>
    {error ? <div className="request-detail-error"><CircleAlert size={18} /><div><b>Les détails complets n’ont pas pu être chargés</b><p>{error}</p><button className="button subtle" onClick={reload}><RefreshCw size={14} />Réessayer</button></div></div> : !request ? <div className="request-detail-loading"><RefreshCw className="spin" size={19} /><span>Chargement des détails du dossier…</span></div> : <>
      <div className="request-detail-hero">
        <div><span className="eyebrow">DEMANDE · {serviceNames[item.reparation_type] || item.reparation_type || 'SAV'}</span><h2>{item.reference_code || selected.id}</h2></div>
        <span className={`request-status ${statusTone}`}><i />{statusNames[currentStatus] || currentStatus}</span>
        <p>{item.problem_description || 'Aucune description du problème n’a été fournie.'}</p>
        <div className="request-next-step"><span><Activity size={14} /></span><p><b>Prochaine étape</b>{nextStep}</p></div>
        {!closed && canAssign && <button className="button primary" onClick={onGoAssign}><Wrench size={15} />{technicianId ? 'Voir l’assignation' : 'Ouvrir l’assignation'}<ArrowUpRight size={14} /></button>}
      </div>

      <DetailSection title="Client et contact" icon={<UserRound size={16} />}>
        <div className="request-detail-grid"><DetailValue label="Client" value={fullName(client) || item.contact_name} /><DetailValue label="Téléphone client" value={client.phone_number || item.contact_phone_number} /><DetailValue label="Email" value={client.email} /><DetailValue label="Référence client" value={client.reference_code} /><DetailValue label="Contact sur place" value={item.contact_name} /><DetailValue label="Téléphone sur place" value={item.contact_phone_number} /></div>
        {(client.phone_number || item.contact_phone_number) && <a className="request-detail-contact" href={`tel:${client.phone_number || item.contact_phone_number}`}><Phone size={14} />Appeler le contact</a>}
      </DetailSection>

      <DetailSection title="Appareil et problème" icon={<Wrench size={16} />}>
        <div className="request-detail-grid"><DetailValue label="Appareil" value={item.device_product?.name_fr || item.device_type || selected.device} /><DetailValue label="Modèle" value={child.device_model || item.device_model || selected.model} /><DetailValue label="Spécialité" value={item.field} /><DetailValue label="Type de service" value={child.service_type === 'flexible' ? 'Flexible' : child.service_type === 'warranty' ? 'Garanti' : child.service_type || serviceNames[item.reparation_type]} /></div>
        {problems.length > 0 && <div className="request-problem-tags">{problems.map(problem => <span key={problem}>{problem.replaceAll('_', ' ')}</span>)}</div>}
        {media.length > 0 && <div className="request-media-grid">{media.map((entry, index) => { const raw = typeof entry === 'string' ? entry : (entry as ApiRecord)?.url || (entry as ApiRecord)?.original_url || (entry as ApiRecord)?.image_url || (entry as ApiRecord)?.path; const src = mediaUrl(base, raw); return src ? <a href={src} target="_blank" rel="noreferrer" key={`${src}-${index}`}><img src={src} alt={`Photo du dossier ${index + 1}`} loading="lazy" /></a> : null; })}</div>}
        {(item.audio_url || child.audio_url) && <audio className="request-audio" controls src={mediaUrl(base, item.audio_url || child.audio_url)}>Audio du client</audio>}
      </DetailSection>

      <DetailSection title="Adresse et disponibilité" icon={<MapPin size={16} />}>
        <div className="request-detail-grid"><DetailValue label="Adresse d’intervention" value={address || child.city || item.city} /><DetailValue label="Wilaya" value={location.wilaya_name || location.province_name || child.province_name || child.province} /><DetailValue label="Disponibilité demandée" value={child.availability} /><DetailValue label="Créneau confirmé" value={child.confirmed_availability} /><DetailValue label="Lieu de réparation" value={child.repair_location} /></div>
        {latitude != null && longitude != null && <a className="request-detail-contact" href={`https://maps.google.com/?q=${latitude},${longitude}`} target="_blank" rel="noreferrer"><MapPin size={14} />Voir la position sur la carte</a>}
      </DetailSection>

      <DetailSection title="Prise en charge" icon={<Activity size={16} />}>
        <div className="request-detail-grid"><DetailValue label="Technicien" value={fullName(technicianUser) || technician.name} /><DetailValue label="Téléphone technicien" value={technicianUser.phone_number || technician.phone_number} /><DetailValue label="Assignation" value={child.assignment_status} /><DetailValue label="Proposé le" value={child.assigned_at ? dateLabel(child.assigned_at) : null} /><DetailValue label="Dernière mise à jour" value={dateLabel(child.updated_at || item.updated_at)} /></div>
        {!technicianId ? <p className="request-detail-hint">Aucun technicien n’est actuellement associé à cette demande.</p> : !fullName(technicianUser) && <p className="request-detail-hint">Profil technicien n°{technicianId} associé.</p>}
      </DetailSection>

      {(prices.length > 0 || diagnostic.description || diagnostic.report || diagnostic.diagnosis) && <DetailSection title="Diagnostic et prix" icon={<CalendarClock size={16} />}>
        {(diagnostic.description || diagnostic.report || diagnostic.diagnosis) && <p className="request-detail-paragraph">{diagnostic.description || diagnostic.report || diagnostic.diagnosis}</p>}
        <div className="request-detail-grid">{prices.map(([label, value]) => <DetailValue key={String(label)} label={String(label)} value={amountLabel(value)} />)}</div>
        <div className="request-detail-grid request-detail-subgrid"><DetailValue label="Prestation" value={child.completion_prestation_type} /><DetailValue label="Gaz" value={child.gas_type && `${child.gas_type}${child.gas_quantity ? ` · ${child.gas_quantity}` : ''}`} /><DetailValue label="Note gaz" value={child.gas_note} /></div>
      </DetailSection>}

      {cancellation.reason && <DetailSection title="Annulation" icon={<CircleAlert size={16} />}><p className="request-detail-paragraph">{cancellation.reason}</p><div className="request-detail-grid"><DetailValue label="Annulée par" value={cancellation.cancelled_by || cancellation.actor} /><DetailValue label="Date" value={dateLabel(cancellation.created_at)} /></div></DetailSection>}
      {(warranty.original_request || warranty.problem_type || item.original_request) && <DetailSection title="Garantie" icon={<CheckCircle2 size={16} />}><div className="request-detail-grid"><DetailValue label="Demande d’origine" value={warranty.original_request?.reference_code || warranty.original_request?.id || item.original_request?.reference_code} /><DetailValue label="Type de problème" value={warranty.problem_type} /><DetailValue label="Statut" value={warranty.status || child.status} /></div></DetailSection>}
      {(workshopTransfer.status || electronicTransfer.status || item.workshop_request) && <DetailSection title="Transfert atelier" icon={<Activity size={16} />}><div className="request-detail-grid"><DetailValue label="Atelier" value={workshopTransfer.workshop?.name || item.workshop_request?.workshop?.name} /><DetailValue label="État atelier" value={workshopTransfer.status || item.workshop_request?.status} /><DetailValue label="Transfert électronique" value={electronicTransfer.status} /><DetailValue label="Raison du transfert" value={child.transfer_reason} /></div></DetailSection>}
      {(review.rating != null || review.comment) && <DetailSection title="Évaluation client" icon={<CheckCircle2 size={16} />}><div className="request-detail-grid"><DetailValue label="Note" value={review.rating != null ? `${review.rating} / 5` : null} /><DetailValue label="Commentaire" value={review.comment} /></div></DetailSection>}

      <DetailSection title="Historique du dossier" icon={<Clock3 size={16} />}>
        {!hasExplicitHistory && timeline.length > 0 && <p className="request-detail-hint">L’API ne fournit pas de journal complet pour ce dossier. Les dates disponibles sont affichées ci-dessous.</p>}
        {timeline.length ? <ol className="request-timeline">{timeline.map((event, index) => <li key={`${event.title}-${index}`} className={index === timeline.length - 1 ? 'current' : ''}><span className="request-timeline-dot" /><div><b>{event.title}</b>{event.detail && <p>{event.detail}</p>}<small>{dateLabel(event.date)}</small></div></li>)}</ol> : <p className="request-detail-hint">Aucun historique d’étapes n’est retourné par l’API pour cette demande.</p>}
        <p className="request-detail-footnote">Créée le {dateLabel(item.created_at)} · Référence API {item.id ?? id}</p>
      </DetailSection>
    </>}
  </>;
}
