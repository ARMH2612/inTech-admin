import type { ApiRecord, ApiRow, PageName, RequestSummary } from '../types';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'intech-admin-session-token';

export function getSavedToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string | null): void {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function normalizeApiBase(value: string): string {
  return value.trim().replace(/\/+$/, '').replace(/\/api$/, '');
}

export async function apiRequest<T = ApiRecord>(base: string, token: string | null, path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { Accept: 'application/json', ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  let response;
  try {
    response = await fetch(`${normalizeApiBase(base)}/api${path.startsWith('/') ? path : `/${path}`}`, { ...options, headers });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Connexion impossible à l’API. Vérifiez que le serveur est joignable et que l’URL configurée est correcte. ${reason}`);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) saveToken(null);
    const validation = payload.errors ? Object.values(payload.errors).flat().join(' ') : '';
    throw new Error(validation || payload.message || `Erreur API (${response.status})`);
  }
  return payload as T;
}

export const endpointForPage: Partial<Record<PageName, [string, string | null]>> = {
  Demandes: ['/admin/requests?per_page=100', 'requests'],
  Assignation: ['/admin/assignments/unassigned?per_page=100', 'requests'],
  Clients: ['/admin/clients?per_page=100', 'clients'],
  Techniciens: ['/admin/technicians?per_page=100', 'technicians'],
  Forfaits: ['/admin/packages', 'data'],
  'Demandes forfaits': ['/admin/package-requests?per_page=100', 'data'],
  'Prix par wilaya': ['/admin/wilaya-prices', 'data'],
  'Domaines de diagnostic': ['/admin/diagnostic-domains', 'data'],
  Prestations: ['/admin/prestation-options', 'data'],
  Appareils: ['/admin/device-products', 'data'],
  'Pièces de rechange': ['/admin/replacement-parts', 'data'],
  'Codes promo': ['/admin/promo-codes', 'data'],
  'Magasins partenaires': ['/admin/spare-parts-shops', 'data'],
  Catégories: ['/admin/shop/categories', 'data'],
  Marques: ['/admin/shop/brands', 'data'],
  Produits: ['/admin/shop/products?per_page=100', 'products'],
  Commandes: ['/admin/shop/orders?per_page=100', 'orders'],
  Réglages: ['/admin/settings', null],
  Administrateurs: ['/admin/admins', 'admins'],
};

const dateLabel = (value?: string | number | null): string => value ? new Date(value).toLocaleString('fr-DZ', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Algiers' }) : '—';
const money = (value?: string | number | null): string => value == null ? '—' : `${Number(value).toLocaleString('fr-DZ')} DA`;
const first = (...values: unknown[]): string | number => (values.find(value => value != null && value !== '') as string | number | undefined) ?? '—';

export function normalizeRow(page: PageName, item: ApiRecord): ApiRow {
  if (!item || typeof item !== 'object') return { ID: String(item ?? '—') };
  switch (page) {
    case 'Demandes':
    case 'Assignation': {
      const child = item.domicile_request || item.ac_request || item.workshop_request || item.warranty_claim_request || item;
      const client = item.user || {};
      const clientName = [client.first_name, client.last_name].filter(Boolean).join(' ');
      return {
        Référence: first(item.reference_code, item.id),
        Client: first(clientName, item.contact_name),
        Téléphone: first(client.phone_number, item.contact_phone_number),
        Appareil: first(item.device_product?.name_fr, item.device_type, child.device_model),
        Type: first(item.reparation_type, child.service_type),
        Statut: first(child.status, item.status),
        Technicien: first(child.technician?.user?.first_name && `${child.technician.user.first_name} ${child.technician.user.last_name || ''}`, 'Non assigné'),
        Créée: dateLabel(item.created_at),
        _id: page === 'Assignation' ? (item.request_id || item.service_request_id || item.id) : item.id,
        _childId: page === 'Assignation' ? item.id : undefined,
      };
    }
    case 'Clients':
      return { Client: [item.first_name, item.last_name].filter(Boolean).join(' ') || '—', Référence: first(item.reference_code, item.id), Téléphone: first(item.phone_number), Email: first(item.email), Demandes: item.requests_count ?? item.service_requests_count ?? '—', Statut: item.is_blocked ? 'Bloqué' : first(item.account_status, 'Actif'), Inscrit: dateLabel(item.created_at), _id: item.id };
    case 'Techniciens':
      return { Technicien: [item.user?.first_name, item.user?.last_name].filter(Boolean).join(' ') || '—', Type: first(item.technician_type), Spécialités: Array.isArray(item.fields) ? item.fields.join(', ') : first(item.fields), Statut: item.is_blocked ? 'Bloqué' : first(item.status), Disponible: item.disponible ? 'Oui' : 'Non', Note: item.avg_rating ?? '—', _id: item.id };
    case 'Forfaits':
      return { Forfait: first(item.name_fr, item.name), Prix: money(item.price), Points: item.points_granted ?? '—', "Mise en avant": item.is_featured ? 'Oui' : 'Non', Statut: item.is_active ? 'Actif' : 'Inactif', _id: item.id };
    case 'Demandes forfaits':
      return { Technicien: [item.technician?.user?.first_name, item.technician?.user?.last_name].filter(Boolean).join(' ') || '—', Forfait: first(item.package?.name_fr), Montant: money(item.amount ?? item.package?.price), Paiement: first(item.payment_method), Statut: first(item.status), Créée: dateLabel(item.created_at), _id: item.id };
    case 'Prix par wilaya':
      return { Wilaya: first(item.name_fr), "À domicile": money(item.domicile_price), "Climatisation": money(item.ac_price), "Frais d’inspection": money(item.inspection_fee), _id: item.id };
    case 'Domaines de diagnostic':
      return { Domaine: first(item.name_fr), Description: first(item.description_fr), Pannes: item.issues?.length ?? 0, Statut: item.is_active ? 'Actif' : 'Inactif', Ordre: item.sort_order ?? '—', _id: item.id };
    case 'Prestations':
      return { Prestation: first(item.title_fr), Type: first(item.reparation_type), "Articles liés": item.items?.length ?? 0, "Type de saisie": first(item.input_type), Statut: item.is_active ? 'Actif' : 'Inactif', _id: item.id };
    case 'Appareils':
      return { Appareil: first(item.name_fr), Clé: first(item.device_key), Gaz: item.eligible_for_gaz ? 'Oui' : 'Non', Statut: item.is_active ? 'Actif' : 'Inactif', Ordre: item.sort_order ?? '—', _id: item.id };
    case 'Codes promo':
      return { Code: first(item.code), Réduction: item.discount_type === 'percentage' ? `${item.discount_value}%` : money(item.discount_value), Utilisations: `${item.used_count ?? 0} / ${item.max_uses ?? '∞'}`, Expiration: dateLabel(item.expires_at), Statut: item.is_active ? 'Actif' : 'Inactif', _id: item.id };
    case 'Produits':
      return { Produit: first(item.name), Référence: first(item.reference), Catégorie: first(item.category?.name_fr), Prix: money(item.price), Stock: item.stock ?? '—', Statut: item.is_active ? 'Actif' : 'Inactif', _id: item.id };
    case 'Commandes':
      return { Commande: first(item.reference, item.reference_code, item.id), Client: [item.user?.first_name, item.user?.last_name].filter(Boolean).join(' ') || '—', Total: money(item.total), Statut: first(item.status), Date: dateLabel(item.created_at), _id: item.id };
    case 'Administrateurs':
      return { Administrateur: [item.first_name, item.last_name].filter(Boolean).join(' '), Email: first(item.email), Rôle: first(item.admin_role), Sections: Array.isArray(item.admin_permissions) ? item.admin_permissions.join(', ') : 'Toutes', Statut: item.is_blocked ? 'Bloqué' : item.activated_at ? 'Actif' : 'Invitation en attente', _id: item.id };
    case 'Pièces de rechange':
      return { Pièce: first(item.title_fr), 'Nom arabe': first(item.title_ar), Appareils: item.applies_to_all ? 'Tous' : Array.isArray(item.device_products) ? item.device_products.map((device: ApiRecord) => device.name_fr || device.id).join(', ') : '—', Statut: item.is_active ? 'Actif' : 'Inactif', Ordre: item.sort_order ?? '—', _id: item.id };
    case 'Magasins partenaires':
      return { Magasin: first(item.name), Catégorie: first(item.category), Adresse: first(item.address), Téléphone: first(item.phone), Ouvert: item.is_open ? 'Oui' : 'Non', Statut: item.is_active === false ? 'Inactif' : 'Actif', _id: item.id };
    case 'Catégories':
      return { Catégorie: first(item.name_fr), 'Nom arabe': first(item.name_ar), Statut: item.is_active ? 'Actif' : 'Inactif', Ordre: item.sort_order ?? '—', _id: item.id };
    case 'Marques':
      return { Marque: first(item.name), Propriétaire: first(item.owner?.first_name && `${item.owner.first_name} ${item.owner.last_name || ''}`), Vérifiée: item.is_verified ? 'Oui' : 'Non', Statut: item.is_active ? 'Actif' : 'Inactif', _id: item.id };
    default: {
      const mapped: ApiRow = {};
      Object.entries(item).filter(([key]) => !['created_at', 'updated_at', 'id'].includes(key) && !key.startsWith('_')).slice(0, 6).forEach(([key, value]) => { mapped[key.replaceAll('_', ' ')] = Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : value ?? '—'; });
      mapped.ID = item.id ?? '—';
      return mapped;
    }
  }
}

export function rowToRequest(row: ApiRow): RequestSummary {
  return { id: row.Référence ?? row._id ?? '—', device: row.Appareil, model: row.Type, kind: row.Type, issue: row.Statut, status: row.Statut, tech: row.Technicien, date: row.Créée, city: '—', apiId: row._id };
}
