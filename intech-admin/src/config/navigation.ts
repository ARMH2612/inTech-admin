import {
  Activity, ArrowDownUp, BadgeCheck, Boxes, BriefcaseBusiness, ClipboardList,
  Coins, CreditCard, Laptop, LayoutDashboard, MapPin, Package, Settings2,
  ShoppingBag, Store, Tag, Users, Wrench,
} from 'lucide-react';
import type { NavigationGroup, PageName } from '../types';

export const navGroups: NavigationGroup[] = [
  { label: 'ACTIVITÉ', items: [['Vue d’ensemble', LayoutDashboard], ['Demandes', ClipboardList], ['Techniciens', Wrench], ['Clients', Users], ['Assignation', ArrowDownUp]] },
  { label: 'CONFIGURATION', items: [['Prestations', BriefcaseBusiness], ['Domaines de diagnostic', Activity], ['Appareils', Laptop], ['Forfaits', Coins], ['Demandes forfaits', CreditCard], ['Prix par wilaya', MapPin]] },
  { label: 'BOUTIQUE', items: [['Catégories', Boxes], ['Marques', BadgeCheck], ['Produits', Package], ['Commandes', ShoppingBag], ['Pièces de rechange', Store], ['Magasins partenaires', Store], ['Codes promo', Tag]] },
];
export const bottomNav: [PageName, typeof Settings2][] = [['Réglages', Settings2]];
export const pageRoutes: Record<PageName, string> = {
  'Vue d’ensemble': '/',
  Demandes: '/requests',
  Techniciens: '/technicians',
  Clients: '/clients',
  Assignation: '/assignments',
  Prestations: '/services',
  'Domaines de diagnostic': '/diagnostic-domains',
  Appareils: '/devices',
  Forfaits: '/packages',
  'Demandes forfaits': '/package-requests',
  'Prix par wilaya': '/wilaya-prices',
  Catégories: '/categories',
  Marques: '/brands',
  Produits: '/products',
  Commandes: '/orders',
  'Pièces de rechange': '/replacement-parts',
  'Magasins partenaires': '/partner-shops',
  'Codes promo': '/promo-codes',
  Réglages: '/settings',
  Administrateurs: '/administrators',
  'Mon profil': '/profile',
};
export const pagePermission: Partial<Record<PageName, string>> = {
  Demandes: 'requests', 'Vue d’ensemble': 'requests', Assignation: 'assignments', Clients: 'clients', Techniciens: 'technicians',
  Prestations: 'prestation_options', 'Domaines de diagnostic': 'diagnostic_domains', Appareils: 'device_products',
  Forfaits: 'packages', 'Demandes forfaits': 'packages', 'Prix par wilaya': 'wilaya_prices',
  'Codes promo': 'promo_codes', 'Pièces de rechange': 'prestation_options', 'Magasins partenaires': 'spare_parts_shops',
  Catégories: 'shop', Marques: 'shop', Produits: 'shop', Commandes: 'shop', Réglages: 'settings', Administrateurs: 'super_admin',
};
export const pageDescriptions: Record<string, string> = {
  Demandes: 'Consultez les demandes de réparation et leur avancement.',
  Techniciens: 'Suivez les inscriptions et l’activité du réseau de techniciens.',
  Clients: 'Consultez les comptes clients et leurs demandes.',
  Assignation: 'Suivez les demandes non assignées et celles en attente de réponse.',
  Prestations: 'Configurez les prestations proposées pendant une intervention.',
  'Domaines de diagnostic': 'Organisez les domaines de panne proposés dans l’application.',
  Appareils: 'Gérez les appareils et les modèles disponibles dans l’application.',
  Forfaits: 'Consultez les offres et les points proposés au réseau professionnel.',
  'Demandes forfaits': 'Vérifiez les paiements et demandes de recharge.',
  'Prix par wilaya': 'Suivez la configuration des tarifs par zone.',
  Réglages: 'Paramétrez les règles de gestion du service.',
  'Mon profil': 'Consultez les informations de votre compte et vos accès.',
};
