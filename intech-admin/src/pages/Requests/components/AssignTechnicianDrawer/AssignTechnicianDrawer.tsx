import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, BriefcaseBusiness, Check, Coins, LoaderCircle, MapPin, RefreshCw, Search, Star, Wrench, X } from 'lucide-react';
import { apiRequest } from '../../../../config/api';
import type { ApiRecord, ApiRow } from '../../../../types';

interface AssignTechnicianDrawerProps { base: string; token: string; row: ApiRow; onClose: () => void; onAssigned: () => void }
function rowRequest(row: ApiRow): ApiRecord { try { return row._raw ? JSON.parse(row._raw) as ApiRecord : {}; } catch { return {}; } }
function displayName(user: ApiRecord | undefined) { return [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Technicien sans nom'; }
function initials(user: ApiRecord | undefined) { return [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'T'; }
function specialtyLabel(value: string) { const labels: Record<string, string> = { refrigeration: 'Réfrigération', washing: 'Lavage', electronics: 'Électronique', air_conditioning: 'Climatisation', ac: 'Climatisation' }; return labels[value] || value.replaceAll('_', ' '); }
function typeLabel(value: string) { const labels: Record<string, string> = { technician: 'Technicien SAV', workshop: 'Atelier partenaire', ac: 'Technicien climatisation', electronic: 'Électronique' }; return labels[value] || value; }

export function AssignTechnicianDrawer({ base, token, row, onClose, onAssigned }: AssignTechnicianDrawerProps) {
  const request = rowRequest(row);
  const child = request.ac_request || request.domicile_request;
  const type = request.ac_request ? 'ac' : 'domicile';
  const [technicians, setTechnicians] = useState<ApiRecord[]>([]);
  const [technicianId, setTechnicianId] = useState('');
  const [search, setSearch] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setSearch(''); setError(''); setTechnicianId(''); setLoading(true); setTechnicians([]);
    apiRequest<ApiRecord>(base, token, `/admin/assignments/${type}/${child.id}/eligible-technicians`)
      .then(result => { if (alive) setTechnicians(Array.isArray(result.technicians) ? result.technicians : []); })
      .catch(cause => { if (alive) setError(cause instanceof Error ? cause.message : String(cause)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [base, token, type, child.id, retryKey]);

  const selectedTechnician = technicians.find(technician => String(technician.id) === technicianId);
  const filteredTechnicians = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return technicians;
    return technicians.filter(technician => [displayName(technician.user), technician.user?.phone_number, technician.technician_type, ...(technician.fields || []), ...(technician.devices || [])].filter(Boolean).join(' ').toLowerCase().includes(query));
  }, [technicians, search]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!technicianId) return;
    setBusy(true); setError('');
    try {
      await apiRequest(base, token, `/admin/assignments/${type}/${child.id}/assign`, { method: 'POST', body: JSON.stringify({ technician_id: Number(technicianId) }) });
      onAssigned();
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  }

  return <div className="mutation-overlay request-assign-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section className="mutation-drawer" role="dialog" aria-modal="true" aria-label="Assigner la demande à un technicien">
      <div className="mutation-head"><div><span className="eyebrow">AFFECTATION MANUELLE</span><h2>Assigner un technicien</h2></div><button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}><X size={19} /></button></div>
      <div className="request-assign-summary"><span><Wrench size={16} /></span><div><b>{row.Référence || row._id}</b><small>{row.Appareil || 'Demande de service'} · {type === 'ac' ? 'Climatisation' : 'À domicile'}</small></div></div>
      <p className="request-assign-explanation">Choisissez un technicien éligible. Il recevra une notification et devra accepter ou refuser la demande.</p>
      {loading ? <div className="request-assign-state"><RefreshCw className="spin" size={18} />Chargement des techniciens éligibles…</div> : error && technicians.length === 0 ? <div className="request-detail-error"><AlertTriangle size={17} /><div><b>La liste des techniciens n’a pas pu être chargée</b><p>{error}</p><button type="button" className="button subtle" onClick={() => setRetryKey(value => value + 1)}><RefreshCw size={14} />Réessayer</button></div></div> : technicians.length === 0 ? <div className="request-assign-empty"><AlertTriangle size={18} /><b>Aucun technicien éligible</b><span>Vérifiez les spécialités, la zone et la disponibilité des techniciens.</span></div> : <form onSubmit={submit}>
        <div className="request-tech-list-head"><div><b>Techniciens éligibles</b><span>{technicians.length} profil{technicians.length > 1 ? 's' : ''} · classés par correspondance et activité</span></div></div>
        <label className="request-tech-search"><Search size={15} /><input type="search" placeholder="Rechercher par nom, spécialité ou téléphone" value={search} onChange={event => setSearch(event.target.value)} /></label>
        <div className="request-tech-options" role="radiogroup" aria-label="Techniciens éligibles">
          {filteredTechnicians.map(technician => {
            const selected = String(technician.id) === technicianId;
            const fields = Array.isArray(technician.fields) ? technician.fields.slice(0, 3) : [];
            return <button type="button" key={technician.id} role="radio" aria-checked={selected} className={`request-tech-option ${selected ? 'is-selected' : ''}`} onClick={() => setTechnicianId(String(technician.id))}>
              <span className="request-tech-avatar">{initials(technician.user)}</span>
              <span className="request-tech-main"><span className="request-tech-name"><b>{displayName(technician.user)}</b><small>#{technician.id}</small></span><span className="request-tech-role">{typeLabel(technician.technician_type || '')}</span>
                <span className="request-tech-tags">{technician.matches_device && <span className="match"><MapPin size={11} />Appareil compatible</span>}{technician.needs_funding && <span className="funding"><AlertTriangle size={11} />Sans points</span>}{fields.map((field: string) => <span key={field}>{specialtyLabel(field)}</span>)}</span>
                <span className="request-tech-metrics"><span><Coins size={12} />{technician.points ?? 0} pts</span><span><Star size={12} />{Number(technician.avg_rating || 0).toFixed(1)}</span><span><BriefcaseBusiness size={12} />{technician.active_requests_count ?? 0} en cours</span></span>
              </span>
              <span className="request-tech-radio">{selected && <Check size={12} />}</span>
            </button>;
          })}
          {!filteredTechnicians.length && <div className="request-tech-no-results">Aucun technicien ne correspond à « {search} ».</div>}
        </div>
        {selectedTechnician?.needs_funding && <div className="request-assign-warning"><AlertTriangle size={16} /><span>Ce technicien n’a pas de points disponibles. L’API le propose comme éligible, mais vérifiez sa situation avant l’affectation.</span></div>}
        {error && <div className="api-error" role="alert">{error}</div>}
        <div className="mutation-actions"><button type="button" className="button subtle" onClick={onClose} disabled={busy}>Annuler</button><button className="button primary" disabled={!technicianId || busy}>{busy ? <LoaderCircle className="spin" size={15} /> : <Wrench size={15} />}{busy ? 'Envoi…' : 'Proposer la demande'}</button></div>
      </form>}
    </section>
  </div>;
}
