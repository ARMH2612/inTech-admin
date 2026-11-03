import type { LucideIcon } from 'lucide-react';

export type PageName =
  | 'Vue d’ensemble' | 'Demandes' | 'Techniciens' | 'Clients' | 'Assignation'
  | 'Prestations' | 'Domaines de diagnostic' | 'Appareils' | 'Forfaits'
  | 'Demandes forfaits' | 'Prix par wilaya' | 'Catégories' | 'Marques'
  | 'Produits' | 'Commandes' | 'Pièces de rechange' | 'Magasins partenaires'
  | 'Codes promo' | 'Réglages' | 'Administrateurs' | 'Mon profil';

export interface NavigationGroup {
  label: string;
  items: [PageName, LucideIcon][];
}

export interface AdminUser {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  admin_role?: string;
  admin_permissions?: string[];
}

export interface ApiSession {
  base: string;
  token: string;
  user: AdminUser;
}

export type ApiRecord = Record<string, any>;

export interface ApiRow extends Record<string, string | number | boolean | undefined> {
  _id?: string | number;
  _raw?: string;
  Référence?: string | number;
  Appareil?: string | number;
  Type?: string | number;
  Statut?: string | number;
  Technicien?: string | number;
  Créée?: string | number;
}

export interface RequestSummary {
  id: string | number;
  device?: string | number;
  model?: string | number;
  kind?: string | number;
  issue?: string | number;
  status?: string | number;
  tech?: string | number;
  date?: string | number;
  city?: string;
  apiId?: string | number;
}

export interface NotificationItem {
  id: string | number;
  type?: string;
  title?: string;
  body?: string;
  created_at?: string;
  is_read: boolean;
}
