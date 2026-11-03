import { useEffect, useState } from 'react';
import { CircleHelp, LockKeyhole } from 'lucide-react';
import { apiRequest } from '../../../../config/api';
import type { ApiRecord, RequestSummary } from '../../../../types';
interface RequestDetailsProps { base: string; token: string; id: string | number | undefined; selected: RequestSummary }
export function RequestDetails({ base, token, id, selected }: RequestDetailsProps) {
  const [request, setRequest] = useState<ApiRecord | null>(null); const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    if (!id) return () => { alive = false; };
    apiRequest<ApiRecord>(base, token, `/admin/requests/${id}`).then(result => { if (alive) setRequest(result.request || result); }).catch(err => { if (alive) setError(err instanceof Error ? err.message : String(err)); });
    return () => { alive = false; };
  }, [base, token, id]);
  const item = request || {}; const client = item.user || {};
  const child = item.domicile_request || item.ac_request || item.workshop_request || item.warranty_claim_request || {};
  const technician = child.technician?.user || child.technician || {};
  const fields = [
    ['Client', [client.first_name, client.last_name].filter(Boolean).join(' ') || item.contact_name],
    ['Téléphone', client.phone_number || item.contact_phone_number], ['Description', item.problem_description],
    ['Disponibilité', child.confirmed_availability || child.availability],
    ['Adresse', child.address?.address || child.address?.label || client.location?.address],
    ['Technicien', [technician.first_name, technician.last_name].filter(Boolean).join(' ')],
    ['Tarif client', child.client_final_price ?? child.final_price], ['Frais d’inspection', child.inspection_fee],
    ['Lieu de réparation', child.repair_location],
    ['Créée le', item.created_at ? new Date(item.created_at).toLocaleString('fr-DZ', { timeZone: 'Africa/Algiers' }) : selected.date],
  ].filter(([, value]) => value != null && value !== '');
  return <><div className="detail-section"><h3>Informations du dossier</h3>{error && <p className="api-detail-error">Détails complets indisponibles : {error}</p>}{!request && !error && <p>Chargement du dossier depuis l’API…</p>}{fields.map(([label, value]) => <div className="detail-line" key={label}><span>{label}</span><b>{label.includes('Tarif') || label.includes('inspection') ? `${Number(value).toLocaleString('fr-DZ')} DA` : String(value)}</b></div>)}</div><div className="drawer-callout"><LockKeyhole size={17} /><p>Détails chargés depuis l’API. Les actions de modification restent désactivées dans cette maquette.</p></div>{error && <CircleHelp size={16} />}</>;
}



